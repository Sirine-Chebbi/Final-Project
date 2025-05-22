import os
import re
from auth_app.models import CustomUser
from django.core.files.storage import default_storage
from rest_framework.response import Response
from rest_framework.decorators import api_view
from .models import ConduitResult


@api_view(['POST'])
def upload_log(request):
    try:
        user = request.user
    except CustomUser.DoesNotExist:
        return Response({"error": "Utilisateur non trouvé"}, status=404)

    # Suppression des anciennes données pour cet utilisateur
    ConduitResult.objects.filter(created_by=user).delete()

    if 'file' not in request.FILES:
        return Response({"error": "Aucun fichier trouvé"}, status=400)

    files = request.FILES.getlist('file')
    file_count = len(files)

    all_test_results = []

    for file in files:
        content = file.read().decode('latin-1').splitlines()

        # Extraction du code
        code = None
        for line in content:
            if "==>" in line:
                match = re.search(r"==>\s+([\w-]+)\s+<==", line)
                if match:
                    code = match.group(1)
                    break

        if not code:
            return Response({"error": f"Code introuvable dans le fichier {file.name}"}, status=400)

        test_results = []
        current_bande = None
        ressource = None

        # SECTION: Extraction des deltas
        delta_entries = []
        in_cal_section = False
        current_band = None
        current_description = None

        for line in content:
            if "CAL_RESULT" in line:
                in_cal_section = True
                continue

            if in_cal_section:
                band_match = re.search(
                    r"\[\s*(\w+G)\s+(\w+(?:\s\w+)?)\s*\]", line)
                if band_match:
                    current_band = band_match.group(1)
                    current_description = band_match.group(2).strip()
                    continue

                delta_match = re.search(
                    r"=>\s*a(\d+)_gainerror_.*?=>\s*a\1_delta=\s*(-?\d+)", line)
                if delta_match and current_band and current_description:
                    delta_entries.append({
                        'bande': current_band,
                        'description': current_description,
                        'ant': int(delta_match.group(1)),
                        'delta': int(delta_match.group(2))
                    })

        # Création des entrées delta
        for entry in delta_entries:
            test_results.append(ConduitResult(
                nom_fichier=file.name,
                nbrfile=file_count,
                code=code,
                bande=entry['bande'],
                description=entry['description'],
                ant=entry['ant'],
                delta=entry['delta'],
                ressource=ressource,
                # Tous les autres champs à None
                frequence=None,
                evm=None,
                power_rms_avg=None,
                power_rms_max=None,
                power_rms_min=None,
                power_dbm_rms_avg=None,
                power_dbm_rms_max=None,
                power_dbm_rms_min=None,
                power_peak_avg=None,
                power_peak_max=None,
                power_peak_min=None,
                power_pre_avg=None,
                power_pre_max=None,
                power_pre_min=None,
                error_message="",
                test_time=None,
                limit_min=None,
                limit_max=None,
                rssi=None,
                rssi_min=None,
                rssi_max=None,
                evm_min=None,
                evm_max=None,
                freq_error_avg=None,
                lo_leakage_dbc=None,
                lo_leakage_margin=None,
                margin_db_lo_a=None,
                margin_db_lo_b=None,
                margin_db_up_a=None,
                margin_db_up_b=None,
                obw_mhz=None,
                violation_percentage=None,
                number_of_avg=None,
                spatial_stream=None,
                amp_err_db=None,
                cable_loss_db=None,
                data_rate=None,
                evm_avg_db=None,
                evm_db_avg=None,
                evm_db_max=None,
                evm_db_min=None,
                freq_at_margin_lo_a=None,
                freq_at_margin_lo_b=None,
                freq_at_margin_up_a=None,
                freq_at_margin_up_b=None,
                freq_error_max=None,
                freq_error_min=None,
                lo_leakage=None,
                obw_freq_start=None,
                obw_freq_stop=None,
                obw_percentage_11ac=None,
                obw_percentage_lower=None,
                obw_percentage_upper=None,
                obw_percentage=None,
                phase_err=None,
                phase_noise_rms=None,
                symbol_clk_err=None,
                tx_power_dbm=None,
                created_by=user,
            ))

        # SECTION: Extraction des autres valeurs
        regex_patterns = {
            "POWER_RMS_AVG_VSA1": r"POWER_RMS_AVG_VSA1\s*:\s*(-?\d+\.\d+)",
            "POWER_RMS_MAX_VSA1": r"POWER_RMS_MAX_VSA1\s*:\s*(-?\d+\.\d+)",
            "POWER_RMS_MIN_VSA1": r"POWER_RMS_MIN_VSA1\s*:\s*(-?\d+\.\d+)",
            "POWER_DBM_RMS_AVG_S1": r"POWER_DBM_RMS_AVG_S1\s*:\s*(-?\d+\.\d+)",
            "POWER_DBM_RMS_MAX_S1": r"POWER_DBM_RMS_MAX_S1\s*:\s*(-?\d+\.\d+)",
            "POWER_DBM_RMS_MIN_S1": r"POWER_DBM_RMS_MIN_S1\s*:\s*(-?\d+\.\d+)",
            "POWER_PEAK_AVG_VSA1": r"POWER_PEAK_AVG_VSA1\s*:\s*(-?\d+\.\d+)",
            "POWER_PEAK_MAX_VSA1": r"POWER_PEAK_MAX_VSA1\s*:\s*(-?\d+\.\d+)",
            "POWER_PEAK_MIN_VSA1": r"POWER_PEAK_MIN_VSA1\s*:\s*(-?\d+\.\d+)",
            "POWER_PRE_AVG_VSA1": r"POWER_PRE_AVG_VSA1\s*:\s*(-?\d+\.\d+)",
            "POWER_PRE_MAX_VSA1": r"POWER_PRE_MAX_VSA1\s*:\s*(-?\d+\.\d+)",
            "POWER_PRE_MIN_VSA1": r"POWER_PRE_MIN_VSA1\s*:\s*(-?\d+\.\d+)",
            "Test Time": r"Test Time\s*=\s*(\d+\.\d+)",
            "ERROR_MESSAGE": r"ERROR_MESSAGE\s*:\s*(.*)",
            "LIMITS": r"(POWER_\S+)\s*:\s*-?\d+\.?\d*\s*dBm\s*\(\s*(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)\s*\)",
            "BSS_FREQ_MHZ_PRIMARY": r"BSS_FREQ_MHZ_PRIMARY\s*:\s*(\d+)",
            "RSSI_RX": r"(RSSI_RX\d+)\s*:\s*(-?\d+\.\d+)\s*dBm\s*\(\s*(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)\s*\)",
            "LIMITS_EVM": r"(PK_EVM_DB_AVG_S1)\s*:\s*(-?\d+\.\d+)\s*dB\s*\(\s*(-?\d+\.\d*)?\s*,\s*(-?\d+\.\d*)\s*\)",
            "RESSOURCE": r"Ressource:\s*([A-Za-z0-9_\-]+)\.",
            # Nouveaux patterns
            "FREQ_ERROR_AVG": r"FREQ_ERROR_AVG\s*:\s*(-?\d+\.\d+)\s*ppm\s*\(\s*(-?\d+)\s*,\s*(-?\d+)\s*\)",
            "LO_LEAKAGE_DBC": r"LO_LEAKAGE_DBC_VSA1\s*:\s*(-?\d+\.\d+)\s*dBc\s*\(\s*,\s*(-?\d+\.?\d*)\s*\)",
            "LO_LEAKAGE_MARGIN": r"LO_LEAKAGE_MARGIN_VSA1\s*:\s*(-?\d+\.\d+)\s*dB\s*\(\s*(-?\d+\.?\d*)\s*,\s*\)",
            "MARGIN_DB_LO_A": r"MARGIN_DB_LO_A_VSA1\s*:\s*(-?\d+\.\d+)\s*dB\s*\(\s*(-?\d+\.?\d*)\s*,\s*\)",
            "MARGIN_DB_LO_B": r"MARGIN_DB_LO_B_VSA1\s*:\s*(-?\d+\.\d+)\s*dB\s*\(\s*(-?\d+\.?\d*)\s*,\s*\)",
            "MARGIN_DB_UP_A": r"MARGIN_DB_UP_A_VSA1\s*:\s*(-?\d+\.\d+)\s*dB\s*\(\s*(-?\d+\.?\d*)\s*,\s*\)",
            "MARGIN_DB_UP_B": r"MARGIN_DB_UP_B_VSA1\s*:\s*(-?\d+\.\d+)\s*dB\s*\(\s*(-?\d+\.?\d*)\s*,\s*\)",
            "OBW_MHZ": r"OBW_MHZ_VSA1\s*:\s*(-?\d+\.\d+)\s*MHz\s*\(\s*(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)\s*\)",
            "VIOLATION_PERCENTAGE": r"VIOLATION_PERCENTAGE_VSA1\s*:\s*(-?\d+\.\d+)\s*%\s*\(\s*(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)\s*\)",
            "NUMBER_OF_AVG": r"NUMBER_OF_AVG\s*:\s*(\d+)",
            "SPATIAL_STREAM": r"SPATIAL_STREAM\s*:\s*(\d+)",
            "AMP_ERR_DB": r"AMP_ERR_DB_VSA1\s*:\s*(-?\d+\.\d+)\s*dB",
            "CABLE_LOSS_DB": r"CABLE_LOSS_DB_RET1\s*:\s*(-?\d+\.\d+)\s*dB",
            "DATA_RATE": r"DATA_RATE\s*:\s*(-?\d+\.\d+)\s*Mbps",
            "EVM_AVG_DB": r"EVM_AVG_DB\s*:\s*(-?\d+\.\d+)\s*dB",
            "EVM_DB_AVG": r"EVM_DB_AVG_S1\s*:\s*(-?\d+\.\d+)\s*dB",
            "EVM_DB_MAX": r"EVM_DB_MAX_S1\s*:\s*(-?\d+\.\d+)\s*dB",
            "EVM_DB_MIN": r"EVM_DB_MIN_S1\s*:\s*(-?\d+\.\d+)\s*dB",
            "FREQ_AT_MARGIN_LO_A": r"FREQ_AT_MARGIN_LO_A_VSA1\s*:\s*(-?\d+\.\d+)\s*MHz",
            "FREQ_AT_MARGIN_LO_B": r"FREQ_AT_MARGIN_LO_B_VSA1\s*:\s*(-?\d+\.\d+)\s*MHz",
            "FREQ_AT_MARGIN_UP_A": r"FREQ_AT_MARGIN_UP_A_VSA1\s*:\s*(-?\d+\.\d+)\s*MHz",
            "FREQ_AT_MARGIN_UP_B": r"FREQ_AT_MARGIN_UP_B_VSA1\s*:\s*(-?\d+\.\d+)\s*MHz",
            "FREQ_ERROR_MAX": r"FREQ_ERROR_MAX\s*:\s*(-?\d+\.\d+)\s*ppm",
            "FREQ_ERROR_MIN": r"FREQ_ERROR_MIN\s*:\s*(-?\d+\.\d+)\s*ppm",
            "LO_LEAKAGE": r"LO_LEAKAGE_VSA1\s*:\s*(-?\d+\.\d+)\s*dB",
            "OBW_FREQ_START": r"OBW_FREQ_START_MHZ_VSA1\s*:\s*(-?\d+\.\d+)\s*MHz",
            "OBW_FREQ_STOP": r"OBW_FREQ_STOP_MHZ_VSA1\s*:\s*(-?\d+\.\d+)\s*MHz",
            "OBW_PERCENTAGE_11AC": r"OBW_PERCENTAGE_11AC\s*:\s*(-?\d+\.\d+)\s*%",
            "OBW_PERCENTAGE_LOWER": r"OBW_PERCENTAGE_LOWER_VSA1\s*:\s*(-?\d+\.\d+)\s*%",
            "OBW_PERCENTAGE_UPPER": r"OBW_PERCENTAGE_UPPER_VSA1\s*:\s*(-?\d+\.\d+)\s*%",
            "OBW_PERCENTAGE": r"OBW_PERCENTAGE_VSA1\s*:\s*(-?\d+\.\d+)\s*%",
            "PHASE_ERR": r"PHASE_ERR_VSA1\s*:\s*(-?\d+\.\d+)\s*Degree",
            "PHASE_NOISE_RMS": r"PHASE_NOISE_RMS_ALL_VSA1\s*:\s*(-?\d+\.\d+)\s*Degree",
            "SYMBOL_CLK_ERR": r"SYMBOL_CLK_ERR_ALL\s*:\s*(-?\d+\.\d+)\s*ppm",
            "TX_POWER_DBM": r"TX_POWER_DBM\s*:\s*(-?\d+\.\d+)\s*dBm",
        }

        in_rssi_section = False
        rssi_values = {}
        rssi_freq, rssi_value, rssi_min, rssi_max = None, None, None, None
        evm, evm_min, evm_max = None, None, None

        # Extraction de la ressource
        for line in content:
            match = re.search(regex_patterns["RESSOURCE"], line)
            if match:
                ressource = match.group(1)
                break

        # Initialisation des nouvelles variables
        freq_error_avg = None
        lo_leakage_dbc = None
        lo_leakage_margin = None
        margin_db_lo_a = None
        margin_db_lo_b = None
        margin_db_up_a = None
        margin_db_up_b = None
        obw_mhz = None
        violation_percentage = None
        number_of_avg = spatial_stream = None
        amp_err_db = cable_loss_db = data_rate = None
        evm_avg_db = evm_db_avg = evm_db_max = evm_db_min = None
        freq_at_margin_lo_a = freq_at_margin_lo_b = None
        freq_at_margin_up_a = freq_at_margin_up_b = None
        freq_error_max = freq_error_min = None
        lo_leakage = None
        obw_freq_start = obw_freq_stop = None
        obw_percentage_11ac = obw_percentage_lower = obw_percentage_upper = obw_percentage = None
        phase_err = phase_noise_rms = None
        symbol_clk_err = tx_power_dbm = None

        for i, line in enumerate(content):
            if "Verify_RSSI" in line:
                in_rssi_section = True

            if "ERROR_MESSAGE" in line:
                in_rssi_section = False

            if in_rssi_section:
                match = re.search(regex_patterns["BSS_FREQ_MHZ_PRIMARY"], line)
                if match:
                    rssi_freq = int(match.group(1))

                match = re.search(regex_patterns["RSSI_RX"], line)
                if match:
                    rssi_ant = match.group(1)
                    rssi_value = float(match.group(2))
                    rssi_min = float(match.group(3))
                    rssi_max = float(match.group(4))
                    rssi_values[rssi_ant] = {
                        'value': rssi_value,
                        'min': rssi_min,
                        'max': rssi_max,
                        'frequency': rssi_freq
                    }
            else:
                rssi_freq, rssi_value, rssi_min, rssi_max = None, None, None, None

            if "TEST wifi" in line:
                match = re.search(r"TEST wifi (\d+)Ghz", line)
                if match:
                    current_bande = f"{match.group(1)}G"

            if "TX_VERIFY" in line:
                match = re.search(r"TX_VERIFY .*? (\d+) .*? ANT(\d+)", line)
                if match:
                    frequence = int(match.group(1))
                    ant = int(match.group(2))
                    rssi_key = f"RSSI_RX{ant}"
                    if rssi_key in rssi_values and rssi_values[rssi_key]['frequency'] == frequence:
                        rssi_value = rssi_values[rssi_key]['value']
                        rssi_min = rssi_values[rssi_key]['min']
                        rssi_max = rssi_values[rssi_key]['max']

                    # Réinitialisation des valeurs pour chaque nouveau test
                    values = {key: None for key in regex_patterns}
                    values["ERROR_MESSAGE"] = ""
                    limit_min, limit_max = None, None
                    evm, evm_min, evm_max = None, None, None
                    freq_error_avg = None
                    lo_leakage_dbc = None
                    lo_leakage_margin = None
                    margin_db_lo_a = None
                    margin_db_lo_b = None
                    margin_db_up_a = None
                    margin_db_up_b = None
                    obw_mhz = None
                    violation_percentage = None
                    number_of_avg = spatial_stream = None
                    amp_err_db = cable_loss_db = data_rate = None
                    evm_avg_db = evm_db_avg = evm_db_max = evm_db_min = None
                    freq_at_margin_lo_a = freq_at_margin_lo_b = None
                    freq_at_margin_up_a = freq_at_margin_up_b = None
                    lo_leakage = None
                    obw_freq_start = obw_freq_stop = None
                    obw_percentage_11ac = obw_percentage_lower = obw_percentage_upper = obw_percentage = None
                    phase_err = phase_noise_rms = None
                    symbol_clk_err = tx_power_dbm = None

                    for j in range(i + 1, len(content)):
                        for key, pattern in regex_patterns.items():
                            match = re.search(pattern, content[j])
                            if match:
                                if key == "LIMITS":
                                    limit_min = float(match.group(2))
                                    limit_max = float(match.group(3))

                                elif key == "LIMITS_EVM":
                                    evm = match.group(2)
                                    evm_min = match.group(3)
                                    evm_max = match.group(4)

                                    if evm is not None:
                                        evm = float(evm)
                                    if evm_min is not None:
                                        evm_min = float(evm_min)
                                    if evm_max is not None:
                                        evm_max = float(evm_max)

                                elif key == "FREQ_ERROR_AVG":
                                    freq_error_avg = float(match.group(1))
                                    

                                elif key == "LO_LEAKAGE_DBC":
                                    lo_leakage_dbc = float(match.group(1))
                                    

                                elif key == "LO_LEAKAGE_MARGIN":
                                    lo_leakage_margin = float(match.group(1))
                                    

                                elif key == "MARGIN_DB_LO_A":
                                    margin_db_lo_a = float(match.group(1))

                                elif key == "MARGIN_DB_LO_B":
                                    margin_db_lo_b = float(match.group(1))

                                elif key == "MARGIN_DB_UP_A":
                                    margin_db_up_a = float(match.group(1))

                                elif key == "MARGIN_DB_UP_B":
                                    margin_db_up_b = float(match.group(1))

                                elif key == "OBW_MHZ":
                                    obw_mhz = float(match.group(1))

                                elif key == "VIOLATION_PERCENTAGE":
                                    violation_percentage = float(match.group(1))

                                elif key == "NUMBER_OF_AVG":
                                    number_of_avg = int(match.group(1))

                                elif key == "SPATIAL_STREAM":
                                    spatial_stream = int(match.group(1))

                                elif key == "AMP_ERR_DB":
                                    amp_err_db = float(match.group(1))

                                elif key == "CABLE_LOSS_DB":
                                    cable_loss_db = float(match.group(1))

                                elif key == "DATA_RATE":
                                    data_rate = float(match.group(1))

                                elif key == "EVM_AVG_DB":
                                    evm_avg_db = float(match.group(1))

                                elif key == "EVM_DB_AVG":
                                    evm_db_avg = float(match.group(1))

                                elif key == "EVM_DB_MAX":
                                    evm_db_max = float(match.group(1))

                                elif key == "EVM_DB_MIN":
                                    evm_db_min = float(match.group(1))

                                elif key == "FREQ_AT_MARGIN_LO_A":
                                    freq_at_margin_lo_a = float(match.group(1))

                                elif key == "FREQ_AT_MARGIN_LO_B":
                                    freq_at_margin_lo_b = float(match.group(1))

                                elif key == "FREQ_AT_MARGIN_UP_A":
                                    freq_at_margin_up_a = float(match.group(1))

                                elif key == "FREQ_AT_MARGIN_UP_B":
                                    freq_at_margin_up_b = float(match.group(1))

                                elif key == "FREQ_ERROR_MAX":
                                    freq_error_max = float(match.group(1))
                                elif key == "FREQ_ERROR_MIN":
                                    freq_error_min = float(match.group(1))

                                elif key == "LO_LEAKAGE":
                                    lo_leakage = float(match.group(1))

                                elif key == "OBW_FREQ_START":
                                    obw_freq_start = float(match.group(1))

                                elif key == "OBW_FREQ_STOP":
                                    obw_freq_stop = float(match.group(1))

                                elif key == "OBW_PERCENTAGE_11AC":
                                    obw_percentage_11ac = float(match.group(1))

                                elif key == "OBW_PERCENTAGE_LOWER":
                                    obw_percentage_lower = float(match.group(1))

                                elif key == "OBW_PERCENTAGE_UPPER":
                                    obw_percentage_upper = float(match.group(1))

                                elif key == "OBW_PERCENTAGE":
                                    obw_percentage = float(match.group(1))

                                elif key == "PHASE_ERR":
                                    phase_err = float(match.group(1))

                                elif key == "PHASE_NOISE_RMS":
                                    phase_noise_rms = float(match.group(1))
 
                                elif key == "SYMBOL_CLK_ERR":
                                    symbol_clk_err = float(match.group(1))

                                elif key == "TX_POWER_DBM":
                                    tx_power_dbm = float(match.group(1))

                                elif key != "ERROR_MESSAGE":
                                    try:
                                        values[key] = float(match.group(1))
                                    except ValueError:
                                        values[key] = match.group(1)
                                else:
                                    values[key] = match.group(1).strip()

                        if "TX_VERIFY" in content[j]:
                            break

                    # Vérification que les valeurs requises sont présentes
                    required_fields = [k for k in regex_patterns if k not in ["ERROR_MESSAGE", "LIMITS", "RSSI_RX", "LIMITS_EVM", "RESSOURCE"]]
                    if any(values.get(key) is not None for key in required_fields):
                        test_results.append(ConduitResult(
                            nom_fichier=file.name,
                            nbrfile=file_count,
                            code=code,
                            bande=current_bande,
                            description=None,
                            frequence=frequence,
                            ant=ant,
                            ressource=ressource,
                            delta=None,
                            evm=evm,
                            power_rms_avg=values["POWER_RMS_AVG_VSA1"],
                            power_rms_max=values["POWER_RMS_MAX_VSA1"],
                            power_rms_min=values["POWER_RMS_MIN_VSA1"],
                            power_dbm_rms_avg=values["POWER_DBM_RMS_AVG_S1"],
                            power_dbm_rms_max=values["POWER_DBM_RMS_MAX_S1"],
                            power_dbm_rms_min=values["POWER_DBM_RMS_MIN_S1"],
                            power_peak_avg=values["POWER_PEAK_AVG_VSA1"],
                            power_peak_max=values["POWER_PEAK_MAX_VSA1"],
                            power_peak_min=values["POWER_PEAK_MIN_VSA1"],
                            power_pre_avg=values["POWER_PRE_AVG_VSA1"],
                            power_pre_max=values["POWER_PRE_MAX_VSA1"],
                            power_pre_min=values["POWER_PRE_MIN_VSA1"],
                            error_message=values["ERROR_MESSAGE"],
                            test_time=values["Test Time"],
                            limit_min=limit_min,
                            limit_max=limit_max,
                            rssi=rssi_value,
                            rssi_min=rssi_min,
                            rssi_max=rssi_max,
                            evm_min=evm_min,
                            evm_max=evm_max,
                            freq_error_avg=freq_error_avg,
                            freq_error_min = freq_error_min,
                            freq_error_max = freq_error_max,
                            lo_leakage_dbc=lo_leakage_dbc,
                            lo_leakage_margin=lo_leakage_margin,
                            margin_db_lo_a=margin_db_lo_a,
                            margin_db_lo_b=margin_db_lo_b,
                            margin_db_up_a=margin_db_up_a,
                            margin_db_up_b=margin_db_up_b,
                            obw_mhz=obw_mhz,
                            violation_percentage=violation_percentage,
                            number_of_avg=number_of_avg,
                            spatial_stream=spatial_stream,
                            amp_err_db=amp_err_db,
                            cable_loss_db=cable_loss_db,
                            data_rate=data_rate,
                            evm_avg_db=evm_avg_db,
                            evm_db_avg=evm_db_avg,
                            evm_db_max=evm_db_max,
                            evm_db_min=evm_db_min,
                            freq_at_margin_lo_a=freq_at_margin_lo_a,
                            freq_at_margin_lo_b=freq_at_margin_lo_b,
                            freq_at_margin_up_a=freq_at_margin_up_a,
                            freq_at_margin_up_b=freq_at_margin_up_b,
                            lo_leakage=lo_leakage,
                            obw_freq_start=obw_freq_start,
                            obw_freq_stop=obw_freq_stop,
                            obw_percentage_11ac=obw_percentage_11ac,
                            obw_percentage_lower=obw_percentage_lower,
                            obw_percentage_upper=obw_percentage_upper,
                            obw_percentage=obw_percentage,
                            phase_err=phase_err,
                            phase_noise_rms=phase_noise_rms,
                            symbol_clk_err=symbol_clk_err,
                            tx_power_dbm=tx_power_dbm,
                            created_by=user
                        ))

        if test_results:
            all_test_results.extend(test_results)

    if not all_test_results:
        return Response({"error": "Aucun test trouvé dans les fichiers"}, status=400)
    
    for result in all_test_results:
        result.User_id = request.user

    ConduitResult.objects.bulk_create(all_test_results) 
    return Response({"message": f"{len(all_test_results)} tests importés avec succès"})


@api_view(['GET'])
def results_without_delta_desc(request):
    exclude_fields = {'description', 'delta'}
    fields = [f.name for f in ConduitResult._meta.get_fields() 
             if f.name not in exclude_fields and not f.is_relation]
    
    # Filtrer par utilisateur connecté
    user = request.user
    queryset = ConduitResult.objects.filter(delta__isnull=True, description__isnull=True, created_by=user)
    results = list(queryset.values(*fields))
    
    return Response({
        "results": results,
    })

@api_view(['GET'])
def results_with_delta_desc(request):
    try:
        fields = [
            f.name for f in ConduitResult._meta.get_fields() 
            if not f.is_relation and f.concrete
        ]
        
        # Filtrer par utilisateur connecté
        user = request.user
        queryset = ConduitResult.objects.exclude(
            delta__isnull=True
        ).exclude(
            description__isnull=True
        ).filter(
            delta__isnull=False, 
            description__isnull=False,
            created_by=user  # Filtrage pour l'utilisateur connecté
        )
        
        results = list(queryset.values(*fields))
        
        if not results:
            return Response({ 
                "message": "No results found with both delta and description values", 
                "results": [] 
            }, status=200)
        
        return Response({ 
            "count": len(results), 
            "results": results,
        })
        
    except Exception as e:
        return Response({
            "error": str(e),
            "message": "An error occurred while processing your request" 
        }, status=500)

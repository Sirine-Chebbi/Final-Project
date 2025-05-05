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
        print(f"File read with {len(content)} lines.")

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
        current_type_gega = None
        ressource = None  # Variable pour stocker la ressource

        # ==================================================
        # SECTION: Extraction des deltas
        # ==================================================
        delta_entries = []  # Pour stocker les entrées de delta
        
        in_cal_section = False
        current_band = None
        current_description = None
        
        for line in content:
            # Détection section CAL_RESULT
            if "CAL_RESULT" in line:
                in_cal_section = True
                continue
                
            if in_cal_section:
                # Détection bande (ex: [5G Low])
                band_match = re.search(r"\[\s*(\w+G)\s+(\w+(?:\s\w+)?)\s*\]", line)
                if band_match:
                    current_band = band_match.group(1)  # "5G"
                    current_description = band_match.group(2).strip()  # "Low", "Mid", etc.
                    continue
                
                # Extraction delta
                delta_match = re.search(r"=>\s*a(\d+)_gainerror_.*?=>\s*a\1_delta=\s*(-?\d+)", line)
                if delta_match and current_band and current_description:
                    delta_entries.append({
                        'type_gega': current_band,
                        'description': current_description,
                        'ant': int(delta_match.group(1)),
                        'delta': int(delta_match.group(2))
                    })
        
        # Création des entrées delta dans la base
        for entry in delta_entries:
            test_results.append(ConduitResult(
                nom_fichier=file.name,
                nbrfile=file_count,
                code=code,
                type_gega=entry['type_gega'],
                description=entry['description'],
                ant=entry['ant'],
                delta=entry['delta'],
                ressource=ressource,  # Ajout de la ressource
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
                created_by=user,
            ))
        # ==================================================
        # FIN SECTION: Extraction des deltas
        # ==================================================

        # SECTION: Extraction des autres valeurs (code existant)
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
                    current_type_gega = f"{match.group(1)}G"

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

                    # Initialisation des valeurs
                    values = {key: None for key in regex_patterns}
                    values["ERROR_MESSAGE"] = ""
                    limit_min, limit_max = None, None
                    evm, evm_min, evm_max = None, None, None

                    for j in range(i + 1, len(content)):
                        for key, pattern in regex_patterns.items():
                            match = re.search(pattern, content[j])
                            if match:
                                if key == "LIMITS":
                                    limit_min = float(match.group(2))
                                    limit_max = float(match.group(3))
                                    
                                if key == "LIMITS_EVM":
                                    evm = match.group(2)
                                    evm_min = match.group(3)
                                    evm_max = match.group(4)

                                    if evm is not None:
                                        evm = float(evm)
                                    else: evm = None
                                    if evm_min is not None:
                                        evm_min = float(evm_min)
                                    else: evm_min = None
                                    if evm_max is not None:
                                        evm_max = float(evm_max)
                                    else: evm_max = None

                                if key != "ERROR_MESSAGE":
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
                    if all(values[key] is not None for key in required_fields):
                        test_results.append(ConduitResult(
                            nom_fichier=file.name,
                            nbrfile=file_count,
                            code=code,
                            type_gega=current_type_gega,
                            description=None,  # Pas de description pour les tests normaux
                            frequence=frequence,
                            ant=ant,
                            ressource=ressource,  # Ajout de la ressource
                            delta=None,  # Pas de delta pour les tests normaux
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
                            created_by=user
                        ))

        if test_results:
            all_test_results.extend(test_results)

    if not all_test_results:
        return Response({"error": "Aucun test trouvé dans les fichiers"}, status=400)

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

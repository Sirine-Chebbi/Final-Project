import re

from django.core.files.storage import default_storage

from rest_framework.response import Response
from rest_framework.decorators import api_view

from .models import TestCondition

# Create your views here.


@api_view(['POST'])
def upload_test_condition(request):
    TestCondition.objects.all().delete()

    if 'file' not in request.FILES:
        return Response({"error": "Aucun fichier trouvé"}, status=400)

    files = request.FILES.getlist('file')
    
    for file in files:
        file_path = None
        try:
            file_path = default_storage.save(f"uploads/{file.name}", file)

            with default_storage.open(file_path, 'rb') as f:
                content = f.read().decode('latin-1')
                
                # Regex corrigées
                application_match = re.search(r'conf_GTW_BWC_Version_Application\s*:\s*([^\n]+)', content)
                iqfact_match = re.search(r'conf_GTW_BWC_Path_script_2GHZ\s*:\s*C:\\LitePoint\\IQfact_plus\\(IQfact\+\_BRCM_[^\\]+)',content)
                bootfs_match = re.search(r'BOOTFS\s*\(bootfs1\):\s*([^\s(]+)', content)
                mcu_match = re.search(r'MCU\s+FIRMWARE:\s*(\d+)', content)
                srom_match = re.search(r'SROM:\s*([^\s\}]+)', content)  # Correction ici
                iqmeasure_match = re.search(r'IQMEASURE_VERSION\s*:\s*([^\n]+)', content)
                hw_version_match = re.search(r'IQTESTER_HW_VERSION_01\s*:\s*([^\n]+)', content)
                tester_sn_match = re.search(r'IQTESTER_SERIAL_NUM_01\s*:\s*(\S+)', content)
                firmware_match = re.search(r'Firmware\s+revision:\s*(\S+)', content)

                TestCondition.objects.create(
                    APPLICATION_VERSION=application_match.group(1).strip() if application_match else None,
                    IQFACT=iqfact_match.group(1).strip() if iqfact_match else None,
                    BOOTFS1=bootfs_match.group(1).strip() if bootfs_match else None,
                    MCU_FIRMWARE=mcu_match.group(1).strip() if mcu_match else None,
                    SROM=srom_match.group(1).strip() if srom_match else None,
                    IQMEASURE_VERSION=iqmeasure_match.group(1).strip() if iqmeasure_match else None,
                    IQTESTER_HW_VERSION_01=hw_version_match.group(1).strip() if hw_version_match else None,
                    Tester_1_SN=tester_sn_match.group(1).strip() if tester_sn_match else None,
                    Firmware_revision=firmware_match.group(1).strip() if firmware_match else None,
                )

        finally:
            if file_path and default_storage.exists(file_path):
                default_storage.delete(file_path)

    return Response({"status": "success", "message": "Données extraites et sauvegardées avec succès"})


@api_view(['GET'])
def get_test_condition(request):
    versions = TestCondition.objects.all()
    
    if not versions.exists():
        return Response({"message": "Aucune donnée disponible"}, status=404)
    
    results = []
    for version in versions:
        results.append({
            "APPLICATION_VERSION": version.APPLICATION_VERSION,
            "IQFACT": version.IQFACT,
            "BOOTFS1": version.BOOTFS1,
            "MCU_FIRMWARE": version.MCU_FIRMWARE,
            "SROM": version.SROM,
            "IQMEASURE_VERSION": version.IQMEASURE_VERSION,
            "IQTESTER_HW_VERSION_01": version.IQTESTER_HW_VERSION_01,
            "Tester_1_SN": version.Tester_1_SN,
            "Firmware_revision": version.Firmware_revision,
        })
    
    return Response(results)
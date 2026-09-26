import { Settings } from "lucide-react";
import { PlaceholderModule } from "@/components/layout/PlaceholderModule";

export default function ConfiguracionPage() {
  return (
    <PlaceholderModule
      icon={Settings}
      titulo="⚙️ Configuración"
      descripcion="Roles y permisos, Brand Brain (tono, colores, palabras prohibidas) e integraciones."
    />
  );
}

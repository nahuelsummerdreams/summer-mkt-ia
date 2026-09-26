import { BarChart3, Camera, Sparkles } from "lucide-react";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { leads, products } from "@/lib/mock-data";
import { computeComercialMetrics, computeNegocioMetrics } from "@/lib/analytics";
import { formatCurrency } from "@/lib/utils";

const ESTADO_LABEL: Record<string, string> = {
  nuevo: "Nuevo",
  contactado: "Contactado",
  interesado: "Interesado",
  cotizando: "Cotizando",
  negociacion: "Negociación",
  reservado: "Reservado",
  vendido: "Vendido",
};

// Rampa secuencial de un solo hue (azul), clara→oscura según avance del
// funnel — nunca color por serie arbitraria, sino magnitud/orden.
const FUNNEL_TONOS = ["bg-blue-200", "bg-blue-300", "bg-blue-400", "bg-blue-500", "bg-blue-600", "bg-blue-700", "bg-blue-800"];

export default function AnalyticsPage() {
  const comercial = computeComercialMetrics(leads, products);
  const negocio = computeNegocioMetrics(leads, products);
  const maxFunnel = Math.max(1, ...comercial.funnel.map((e) => e.cantidad));

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-8 sm:px-6">
      <div className="flex items-center gap-2">
        <BarChart3 className="h-6 w-6 text-green" />
        <div>
          <h1 className="text-2xl font-extrabold text-navy">Analytics</h1>
          <p className="mt-1 text-gray-500">
            Marketing, comercial, contenido y negocio (spec §23). Cada número sale de Leads/Productos ya cargados —
            donde no hay una fuente conectada, se dice explícitamente en vez de inventar una cifra.
          </p>
        </div>
      </div>

      {/* COMERCIAL */}
      <section className="space-y-4">
        <h2 className="text-sm font-bold text-navy">Comercial</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Card>
            <CardBody className="text-center">
              <p className="text-2xl font-extrabold text-navy">{comercial.totalLeads}</p>
              <p className="text-xs text-gray-500">Leads totales</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="text-center">
              <p className="text-2xl font-extrabold text-navy">
                {comercial.conversion != null ? `${Math.round(comercial.conversion * 100)}%` : "—"}
              </p>
              <p className="text-xs text-gray-500">Conversión</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="text-center">
              <p className="text-2xl font-extrabold text-navy">{comercial.ventas.cantidad}</p>
              <p className="text-xs text-gray-500">Ventas</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="text-center">
              <p className="text-2xl font-extrabold text-navy">
                {comercial.ticketPromedio != null ? formatCurrency(comercial.ticketPromedio) : "—"}
              </p>
              <p className="text-xs text-gray-500">Ticket promedio</p>
            </CardBody>
          </Card>
        </div>

        <Card>
          <CardBody className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-navy">Facturación estimada</p>
              <p className="text-lg font-extrabold text-navy">{formatCurrency(comercial.ventas.facturacionEstimada)}</p>
            </div>
            <p className="text-xs text-gray-400">
              Calculada sobre leads en estado &ldquo;vendido&rdquo; × precio de venta del producto asociado. Sin ventas
              registradas todavía, esto se mantiene en $0 — no es una proyección.
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="space-y-3">
            <p className="text-sm font-semibold text-navy">Leads por etapa del embudo</p>
            <div className="space-y-2">
              {comercial.funnel.map((e, i) => (
                <div key={e.estado} className="flex items-center gap-3">
                  <span className="w-24 shrink-0 text-xs text-gray-500">{ESTADO_LABEL[e.estado]}</span>
                  <div className="h-3 flex-1 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className={`h-full rounded-full ${FUNNEL_TONOS[i]}`}
                      style={{ width: `${(e.cantidad / maxFunnel) * 100}%` }}
                    />
                  </div>
                  <span className="w-6 shrink-0 text-right text-xs font-semibold text-navy">{e.cantidad}</span>
                </div>
              ))}
            </div>
            {comercial.perdidos > 0 && (
              <p className="text-xs text-gray-400">
                + {comercial.perdidos} lead(s) marcados como perdidos (fuera del embudo activo).
              </p>
            )}
          </CardBody>
        </Card>

        <div className="flex flex-wrap gap-2">
          <Badge className="bg-red-50 text-red-600">🔥 {comercial.hot} Hot</Badge>
          <Badge className="bg-amber-50 text-amber-700">🟡 {comercial.warm} Warm</Badge>
          <Badge className="bg-blue-50 text-blue-600">🔵 {comercial.cold} Cold</Badge>
        </div>
      </section>

      {/* NEGOCIO */}
      <section className="space-y-3">
        <h2 className="text-sm font-bold text-navy">Negocio</h2>
        <Card>
          <CardBody className="space-y-2">
            {negocio.productoConMasLeads ? (
              <p className="text-sm text-gray-600">
                <strong className="text-navy">{negocio.productoConMasLeads.producto.nombre}</strong> es el producto
                con más leads asociados ({negocio.productoConMasLeads.cantidad}).
              </p>
            ) : (
              <p className="text-sm text-gray-400">Todavía no hay leads asociados a un producto.</p>
            )}
            <p className="text-xs text-gray-400">
              Producto con mayor margen: sin datos de costo/margen cargados en el catálogo todavía.
            </p>
          </CardBody>
        </Card>
      </section>

      {/* MARKETING */}
      <section className="space-y-3">
        <h2 className="text-sm font-bold text-navy">Marketing</h2>
        <Card>
          <CardBody className="flex items-start gap-3">
            <Camera className="mt-0.5 h-5 w-5 text-gray-300" />
            <p className="text-sm text-gray-400">
              Alcance, views, engagement, seguidores y clicks se completan cuando se conecte Instagram/TikTok desde
              el AI Model Hub. Sin esa conexión, no se muestra ningún número simulado.
            </p>
          </CardBody>
        </Card>
      </section>

      {/* CONTENIDO */}
      <section className="space-y-3">
        <h2 className="text-sm font-bold text-navy">Contenido</h2>
        <Card>
          <CardBody className="flex items-start gap-3">
            <Sparkles className="mt-0.5 h-5 w-5 text-gray-300" />
            <p className="text-sm text-gray-400">
              Content Studio todavía no guarda un historial de lo que genera, así que no hay &ldquo;mejor Reel&rdquo;
              ni &ldquo;mejor Hook&rdquo; para mostrar — eso requiere persistir generaciones y su rendimiento real.
            </p>
          </CardBody>
        </Card>
      </section>
    </div>
  );
}

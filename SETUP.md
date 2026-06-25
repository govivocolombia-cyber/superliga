# Siguiente paso

## 1. Crear `.env.local`

Copia `.env.example` y completa:

```txt
NEXT_PUBLIC_SUPABASE_URL=tu_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key

NEXT_PUBLIC_SITE_URL=http://127.0.0.1:3000
EVENT_SLUG=mi-evento-bogota

WOMPI_PUBLIC_KEY=tu_pub_test_o_pub_prod
WOMPI_PRIVATE_KEY=tu_prv_test_o_prv_prod
WOMPI_INTEGRITY_KEY=tu_integrity_key
WOMPI_EVENTS_KEY=tu_events_key

ADMIN_PIN=cambia_este_pin
CHECKIN_PIN=cambia_este_pin
```

## 2. Probar local

```bash
pnpm dev
```

Abre:

```txt
http://127.0.0.1:3000
```

## 3. Flujo de prueba

1. Compra una entrada desde `/`.
2. Si Wompi no esta configurado, entra a `/admin`.
3. Confirma la orden con `ADMIN_PIN`.
4. Abre el ticket generado.
5. Entra a `/checkin` desde otro celular o navegador.
6. Escanea el QR.

## 4. Produccion

Cuando publiques en Vercel, actualiza:

```txt
NEXT_PUBLIC_SITE_URL=https://tu-dominio.com
```

Y en Wompi configura la URL de eventos:

```txt
https://tu-dominio.com/api/wompi/webhook
```

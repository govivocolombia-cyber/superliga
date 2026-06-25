# Ticketing Evento

MVP para vender entradas, generar tickets con QR y hacer check-in desde celular.

## Configuracion

1. Copia `.env.example` a `.env.local`.
2. Pega las llaves de Supabase y Wompi.
3. Instala dependencias:

```bash
pnpm install
```

4. Corre local:

```bash
pnpm dev
```

## Rutas

- `/`: pagina de venta.
- `/admin`: panel simple para ver ordenes y confirmar pagos manualmente.
- `/ticket/[token]`: ticket digital con QR.
- `/checkin`: escaner web para staff.

## URL de eventos Wompi

Cuando publiques la app, configura en Wompi:

```txt
https://tu-dominio.com/api/wompi/webhook
```

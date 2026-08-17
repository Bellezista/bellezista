// Kit Traspaso: precio y textos (copy cerrado por el cliente). Importe en
// céntimos (Stripe).
export const KIT_TRASPASO = {
  importe: 14900, // 149 €
  moneda: "eur" as const,
  nombre: "Kit Traspaso",
};

export const KIT_VENTAJAS = [
  "Documento de reserva (paga y señal) personalizado con los datos de tu negocio y comprador.",
  "Contrato de traspaso definitivo, listo para firmar.",
  "Pack de imágenes y textos profesionales para enviar a los interesados que contacten contigo.",
  "Redactado específicamente para tu operación, no es una plantilla genérica descargable.",
  "Recibirás todo por email en un plazo máximo de 24 horas laborables.",
];

export const KIT_INFO_NECESARIA = [
  "Datos del negocio (nombre comercial, dirección, actividad).",
  "Datos de la parte Cedente (nombre, DNI/CIF, domicilio).",
  "Datos del Cesionario / comprador (nombre, DNI/NIE, domicilio).",
  "Precio del traspaso y forma de pago acordada.",
  "Importe de la reserva/señal y cuenta bancaria de destino.",
  "Fecha máxima para la firma del contrato definitivo.",
  "Condiciones del alquiler actual (importe y si está pendiente de aceptación de la propiedad).",
  "Fotos del negocio para el pack de imágenes.",
];

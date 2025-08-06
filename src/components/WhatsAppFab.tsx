import { useLocation } from "react-router-dom";

const phone = "542914421242"; // Cambia por el tuyo

export default function WhatsAppFab() {
  const location = useLocation();

  let message = "Hola! Quiero hacer una consulta sobre campos";
  if (location.pathname.startsWith("/properties/")) {
    const url = window.location.origin + location.pathname;
    message = `Hola, me interesa este campo: ${url}`;
  }

  const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={whatsappUrl}
      className="fixed bottom-6 right-6 z-[100] shadow-lg rounded-full bg-green-500 hover:bg-green-600 transition-colors p-3 flex items-center justify-center"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chatear por WhatsApp"
    >
      {/* SVG de WhatsApp */}
      <svg xmlns="http://www.w3.org/2000/svg" width={36} height={36} viewBox="0 0 32 32" fill="white">
        <path d="M16.002 2.999c-7.182 0-13.001 5.819-13.001 13.001 0 2.294.602 4.527 1.741 6.486l-1.827 6.68 6.847-1.797c1.91 1.067 4.081 1.631 6.24 1.631h.001c7.181 0 13.001-5.818 13.001-13s-5.82-13.001-13.002-13.001zm0 23.702h-.001c-1.993 0-3.976-.5-5.7-1.446l-.409-.219-4.062 1.067 1.082-3.959-.266-.408c-1.071-1.641-1.639-3.546-1.639-5.507 0-5.574 4.526-10.1 10.002-10.1 2.685 0 5.208 1.048 7.105 2.948 1.897 1.899 2.947 4.422 2.947 7.107 0 5.574-4.526 10.1-10.058 10.1zm5.429-7.571c-.297-.148-1.761-.867-2.035-.967-.273-.099-.471-.148-.67.15-.198.297-.767.967-.941 1.164-.173.199-.347.223-.644.075-.297-.149-1.253-.461-2.39-1.469-.883-.786-1.48-1.758-1.653-2.055-.173-.298-.018-.458.13-.605.134-.133.298-.347.447-.52.149-.174.199-.298.298-.497.099-.199.05-.373-.025-.521-.075-.149-.669-1.613-.917-2.213-.242-.58-.487-.5-.669-.51l-.57-.01c-.198 0-.521.075-.794.373-.273.298-1.042 1.018-1.042 2.479 0 1.461 1.068 2.875 1.217 3.074.149.198 2.105 3.217 5.103 4.389.714.308 1.271.491 1.706.628.717.229 1.371.197 1.886.12.576-.086 1.761-.719 2.011-1.413.248-.694.248-1.289.173-1.413-.074-.124-.273-.198-.57-.347z" />
      </svg>
    </a>
  );
}

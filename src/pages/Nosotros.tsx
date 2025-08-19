export default function Nosotros() {
  return (
    <div className="max-w-2xl mx-auto px-2 sm:px-4 py-10 flex flex-col items-center animate-fade-in">
      <div className="w-full bg-crema rounded-2xl shadow-xl p-6 sm:p-10 border border-[#ebdbb9]">
        <h1
          className="text-2xl sm:text-3xl font-bold mb-4 text-center drop-shadow text-black uppercase"
          style={{ fontFamily: "'Libre Baskerville', serif" }}
        >
          SOBRE NOSOTROS
        </h1>
        <div className="text-center max-w-lg mx-auto space-y-6">
          <p style={{ fontFamily: "'PT Serif', serif" }}>
            En <strong>Campos Barrientos</strong> conocemos la
            experiencia que da el trabajo honesto y el trato directo, y llevamos
            adelante una labor que va mucho más allá de una simple operación
            inmobiliaria. Nos especializamos en la compra, venta y
            administración de campos, comprendiendo tanto su valor económico
            como su dimensión emocional y productiva.
          </p>
          <p style={{ fontFamily: "'PT Serif', serif" }}>
            Nuestro enfoque se basa en dos pilares que nos definen:{" "}
            <strong>Confianza</strong> y <strong>Dedicación</strong>.
            Acompañamos a nuestros clientes en cada etapa del proceso, con
            asesoramiento personalizado, transparencia y una mirada integral del
            mercado rural.
          </p>
          <p style={{ fontFamily: "'PT Serif', serif" }}>
            En <strong>Campos Barrientos</strong>, entendemos el valor
            de lo que está en juego: patrimonio, historia, esfuerzo. Por eso
            trabajamos con la misma responsabilidad con la que se cuida la
            tierra: con respeto, paciencia y compromiso.
          </p>
          <p style={{ fontFamily: "'PT Serif', serif" }}>
            Te invitamos a formar parte de esta historia. Estamos para ayudarte
            a encontrar mucho más que una propiedad, estamos para ayudarte a
            encontrar tu lugar.
          </p>
        </div>
      </div>
    </div>
  );
}

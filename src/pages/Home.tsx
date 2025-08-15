import { NavLink } from "react-router-dom";

export default function Home() {
  return (
    <div className="mt-15 md:mt-15 flex justify-center items-center min-h-[60vh]">
      <div className="bg-crema rounded-2xl shadow-xl p-8 max-w-xl w-full animate-fade-in text-center">
        <h1 className="text-3xl font-bold mb-4">BIENVENIDO</h1>
        <p className="text-lg mb-8" style={{ fontFamily: "'PT Serif', serif" }}>
          Este es un espacio de la agencia inmobiliaria <strong>Barrientos Propiedades </strong>
          dedicado a la comercialización y gestión de campos, brindando la
          seriedad, cercanía y compromiso que nos caracteriza.
          <br />
          <br />
          En <strong>Barrientos Propiedades</strong> contamos con un área especializada en la
          <strong> compra, venta y administración de campos</strong>, orientado a ofrecer
          soluciones integrales al sector rural, y brindando un servicio
          profesional, enfocado en resultados.
        </p>
        <h2 className="text-3xl font-bold mb-4">¿CÓMO PODEMOS AYUDARTE?</h2>
        <div className="flex flex-col gap-4 items-center w-full max-w-sm mx-auto">
          <NavLink
            to="/publicar"
            className="w-full py-3 rounded-xl font-semibold text-[#8d6d19] text-lg shadow bg-[#fbe2a7]
      hover:bg-[#f7e2b8] hover:text-[#ad924a] transition-all duration-200 border border-[#f2dbb1]
      active:scale-95 text-center"
          >
            Quiero vender o arrendar mi campo
          </NavLink>
          <NavLink
            to="/comprar"
            className="w-full py-3 rounded-xl text-[#8d6d19] font-semibold text-lg shadow bg-[#fbe2a7]
      hover:bg-[#f7e2b8] hover:text-[#ad924a] transition-all duration-200 border border-[#f2dbb1]
      active:scale-95 text-center"
          >
            Quiero comprar un campo
          </NavLink>
          <NavLink
            to="/alquilar"
            className="w-full py-3 rounded-xl text-[#8d6d19] font-semibold text-lg shadow bg-[#fbe2a7]
      hover:bg-[#f7e2b8] hover:text-[#ad924a] transition-all duration-200 border border-[#f2dbb1]
      active:scale-95 text-center"
          >
            Quiero alquilar un campo
          </NavLink>
        </div>
      </div>
    </div>
  );
}

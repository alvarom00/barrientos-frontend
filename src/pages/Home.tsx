import { NavLink } from "react-router-dom";
import React from "react";

type ServiceRowProps = {
  title: string;
  text: string;
  img: string;
  imgAlt: string;
  imageRight?: boolean;
};

function ServiceRow({
  title,
  text,
  img,
  imgAlt,
  imageRight = true,
}: ServiceRowProps): React.JSX.Element {
  return (
    <div
      className={`grid gap-6 md:gap-10 md:grid-cols-2 items-center ${
        imageRight ? "" : "md:[&>*:first-child]:order-2"
      }`}
    >
      {/* Texto */}
      <div>
        <h3
          className="text-2xl font-semibold mb-3 text-black capitalize text-center"
          style={{ fontFamily: "'Libre Baskerville', serif" }}
        >
          {title}
        </h3>
        <p
          className="text-lg leading-relaxed text-neutral-800"
          style={{ fontFamily: "'PT Serif', serif" }}
        >
          {text}
        </p>
      </div>

      {/* Imagen */}
      <div className="w-full">
        <img
          src={img}
          alt={imgAlt}
          className="w-full h-auto rounded-xl shadow-md object-cover border border-[#f2dbb1]"
        />
      </div>
    </div>
  );
}

export default function Home(): React.JSX.Element {
  return (
    <div className="mt-15 md:mt-15 flex flex-col items-center min-h-[60vh] gap-10">
      {/* CONTENEDOR EXISTENTE */}
      <div className="bg-crema rounded-2xl shadow-xl p-8 max-w-xl w-full animate-fade-in text-center border border-[#f2dbb1]">
        <h1
          className="text-3xl font-bold mb-4 text-black uppercase"
          style={{ fontFamily: "'Libre Baskerville', serif" }}
        >
          BIENVENIDO
        </h1>
        <p
          className="text-lg mb-8 text-neutral-800"
          style={{ fontFamily: "'PT Serif', serif" }}
        >
          Este es un espacio de la agencia inmobiliaria{" "}
          <strong>Barrientos Propiedades </strong>
          dedicado a la comercialización y gestión de campos, brindando la
          seriedad, cercanía y compromiso que nos caracteriza.
          <br />
          <br />
          En <strong>Barrientos Propiedades</strong> contamos con un área
          especializada en la
          <strong> compra, venta y administración de campos</strong>, orientado
          a ofrecer soluciones integrales al sector rural, y brindando un
          servicio profesional, enfocado en resultados.
        </p>
        <h2
          className="text-3xl font-bold mb-4 text-black uppercase"
          style={{ fontFamily: "'Libre Baskerville', serif" }}
        >
          ¿CÓMO PODEMOS AYUDARTE?
        </h2>
        <div className="flex flex-col gap-4 items-center w-full max-w-sm mx-auto">
          <NavLink
            to="/publicar"
            className="w-full py-3 rounded-xl font-semibold text-black text-lg shadow bg-[#fbe2a7]
      hover:bg-[#f7e2b8] hover:text-[#ad924a] transition-all duration-200 border border-[#f2dbb1]
      active:scale-95 text-center"
          >
            Quiero vender o arrendar mi campo
          </NavLink>
          <NavLink
            to="/comprar"
            className="w-full py-3 rounded-xl text-black font-semibold text-lg shadow bg-[#fbe2a7]
      hover:bg-[#f7e2b8] hover:text-[#ad924a] transition-all duration-200 border border-[#f2dbb1]
      active:scale-95 text-center"
          >
            Quiero comprar un campo
          </NavLink>
          <NavLink
            to="/alquilar"
            className="w-full py-3 rounded-xl text-black font-semibold text-lg shadow bg-[#fbe2a7]
      hover:bg-[#f7e2b8] hover:text-[#ad924a] transition-all duration-200 border border-[#f2dbb1]
      active:scale-95 text-center"
          >
            Quiero alquilar un campo
          </NavLink>
        </div>
      </div>

      {/* NUEVO CONTENEDOR: NUESTROS SERVICIOS */}
      <div className="bg-crema rounded-2xl shadow-xl p-8 w-full max-w-5xl animate-fade-in border border-[#f2dbb1]">
        <div className="text-center mb-8">
          <h2
            className="text-3xl font-bold mb-2 text-black uppercase"
            style={{ fontFamily: "'Libre Baskerville', serif" }}
          >
            NUESTROS SERVICIOS
          </h2>
          <p
            className="text-lg max-w-3xl mx-auto text-neutral-800"
            style={{ fontFamily: "'PT Serif', serif" }}
          >
            Servicio profesional e integral para vender o arrendar campos,
            propiedades rurales y terrenos.
          </p>
        </div>

        <div className="space-y-12">
          {/* Intro general sin imagen */}
          <div className="rounded-xl p-5 bg-white/40 border border-[#f2dbb1]">
            <p
              className="text-lg leading-relaxed text-neutral-800"
              style={{ fontFamily: "'PT Serif', serif" }}
            >
              En <strong>Campos Barrientos</strong> brindamos un servicio
              inmobiliario integral, especializado en la comercialización y
              gestión de campos y propiedades rurales. Nos enfocamos en ofrecer
              un acompañamiento profesional en cada etapa del proceso,
              utilizando herramientas tecnológicas avanzadas y estrategias de
              comercialización efectivas.
            </p>
          </div>

          {/* 1) Imágenes terrestres y aéreas */}
          <ServiceRow
            title="Imágenes terrestres y aéreas profesionales e imágenes satelitales"
            text={`Capturamos la esencia de cada campo con imágenes satelitales y tomas aéreas realizadas con drones
profesionales. Este material visual de alta calidad permite mostrar cada rincón de la propiedad desde una
perspectiva clara, impactante y realista.`}
            img="/aereas.png"
            imgAlt="Toma aérea con dron de un campo"
            imageRight
          />

          {/* 2) Producción audiovisual */}
          <ServiceRow
            title="Producción de contenido audiovisual"
            text={`Creamos y editamos videos promocionales de alta calidad, especialmente diseñados para potenciar la
visibilidad de cada propiedad en nuestros sitios web y redes sociales. Este material es clave para destacar en un
mundo cada vez más visual y competitivo.`}
            img="/edicion.jpg"
            imgAlt="Edición de video promocional de un campo"
            imageRight={false}
          />

          {/* 3) Publicación y promoción online */}
          <ServiceRow
            title="Publicación y promoción online"
            text={`Publicamos cada propiedad en nuestros sitios web, redes sociales y en más de 10 portales inmobiliarios
de alcance nacional e internacional, asegurando una difusión efectiva y orientada al público objetivo. Nuestro
enfoque combina tecnología y estrategia para maximizar las oportunidades de venta o alquiler.`}
            img="/publicar.jpg"
            imgAlt="Promoción de propiedades en portales y redes"
            imageRight
          />

          {/* 4) Gestión de visitas */}
          <ServiceRow
            title="Gestión de visitas y muestras"
            text={`Coordinamos y realizamos todas las visitas necesarias a la propiedad con potenciales compradores o
arrendatarios, brindando un acompañamiento personalizado e información detallada para garantizar una experiencia
positiva y transparente.`}
            img="/visita.webp"
            imgAlt="Visita guiada a un campo"
            imageRight={false}
          />

          {/* 5) Asesoramiento integral */}
          <ServiceRow
            title="Asesoramiento integral"
            text={`Ofrecemos servicios de asesoramiento y acompañamiento profesional durante todo el proceso, desde la
tasación inicial hasta la firma del contrato o escritura. Nuestro equipo se encarga de cada detalle, garantizando
operaciones eficientes, seguras y exitosas.`}
            img="/asesoramiento.jpg"
            imgAlt="Reunión de asesoramiento profesional"
            imageRight
          />
        </div>
      </div>
    </div>
  );
}

const InternalSystemAccessError = () => {
  return (
    <main className="sso__main">
      <div className="sso__card">
        <h1 className="sso__title">Ocurrió un error</h1>
        <p className="sso__paragraph">
          No se obtuvo la información del usuario desde el <code>servidor interno</code>
        </p>
      </div>
    </main>
  );
};

export default InternalSystemAccessError;

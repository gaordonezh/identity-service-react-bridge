import { useEffect, useMemo, useState, type SubmitEvent } from 'react';
import type { FormUpdateFields, RequiredActionsProps } from '../types/global';

interface UpdateUserRequiredFieldsProps extends RequiredActionsProps {
  onSubmit: (data: FormUpdateFields) => Promise<boolean>;
  omitReload: boolean;
}

const emailPattern = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/i;

const UpdateUserRequiredFields = ({
  email: needUpdateEmail,
  password: needUpdatePassword,
  omitReload,
  onSubmit,
}: UpdateUserRequiredFieldsProps) => {
  const [fields, setFields] = useState({ mail: '', pass: '', cpass: '' });
  const [block, setBlock] = useState(true);
  const [forceValidate, setForceValidate] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    setLoading(true);

    setForceValidate(!forceValidate);

    const validated = handleValidateFields();

    const fieldsToValidate: Record<string, boolean> = {};

    if (needUpdateEmail) {
      fieldsToValidate.mail = validated.mail;
    }

    if (needUpdatePassword) {
      fieldsToValidate.pass = validated.pass;
      fieldsToValidate.cpass = validated.cpass;
    }

    const hasErrors = Object.values(fieldsToValidate).every((item) => !item);
    if (!hasErrors) {
      setLoading(false);
      return;
    }

    const isOk = await onSubmit({ emailStr: fields.mail.trim(), passwordStr: fields.pass.trim() });

    if (isOk && !omitReload) {
      globalThis.location.reload();
    }

    setLoading(false);
  };

  useEffect(() => {
    setTimeout(() => {
      setBlock(false);
    }, 500);
    return () => {
      setBlock(true);
    };
  }, []);

  const handleSetValue = (key: keyof typeof fields, value: string) => {
    const cleaned = value.trim().replaceAll(' ', '');
    fields[key] = cleaned;
    setFields({ ...fields });
  };

  const handleValidateFields = () => ({
    mail: !emailPattern.test(fields.mail),
    pass: fields.pass.trim().length < 5,
    cpass: !fields.cpass || fields.cpass !== fields.pass,
  });

  const errors = useMemo(() => {
    if (block) return;
    return handleValidateFields();
  }, [fields, forceValidate]);

  return (
    <form className="sso__card" onSubmit={handleSubmit}>
      <p className="sso__paragraph">Antes de continuar, necesitamos que actualices la siguiente información:</p>

      {needUpdateEmail ? (
        <div className="sso__inputgroup">
          <label htmlFor="email_input" className="sso__inputlabel">
            Correo
          </label>
          <input
            id="email_input"
            autoComplete="email"
            name="email"
            type="email"
            className={`sso__input${errors?.mail ? ' sso__input--error' : ''}`}
            placeholder="correo@ejemplo.com"
            value={fields.mail}
            onChange={(event) => handleSetValue('mail', event.target.value)}
            disabled={loading}
            readOnly={loading}
          />
          {errors?.mail ? <span className="sso__inputmsg">Ingrese un correo válido</span> : null}
        </div>
      ) : null}

      {needUpdatePassword ? (
        <div style={{ width: '100%' }}>
          <div className="sso__inputgroup">
            <label htmlFor="password_input" className="sso__inputlabel">
              Contraseña
            </label>
            <input
              id="password_input"
              autoComplete="new-password"
              name="password"
              type="text"
              className={`sso__input${errors?.pass ? ' sso__input--error' : ''}`}
              placeholder="Ingrese su contraseña"
              value={fields.pass}
              onChange={(event) => handleSetValue('pass', event.target.value)}
              disabled={loading}
              readOnly={loading}
            />
            {errors?.pass ? <span className="sso__inputmsg">Ingrese una contraseña válida</span> : null}
          </div>

          <div className="sso__inputgroup">
            <label htmlFor="cpassword_input" className="sso__inputlabel">
              Confirme su contraseña
            </label>
            <input
              id="cpassword_input"
              autoComplete="new-password"
              name="cpassword"
              type="text"
              className={`sso__input${errors?.cpass ? ' sso__input--error' : ''}`}
              placeholder="Ingrese su contraseña"
              value={fields.cpass}
              onChange={(event) => handleSetValue('cpass', event.target.value)}
              disabled={loading}
              readOnly={loading}
            />
            {errors?.cpass ? <span className="sso__inputmsg">Las contraseñas no coinciden</span> : null}
          </div>
        </div>
      ) : null}

      <button className="sso__button sso__button--full" type="submit" disabled={loading}>
        {loading ? 'CARGANDO...' : 'ACTUALIZAR'}
      </button>
    </form>
  );
};

export default UpdateUserRequiredFields;

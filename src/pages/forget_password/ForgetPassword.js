import React, { useEffect, useState, useRef } from "react";
import { useParams } from 'react-router-dom';

import {
  Grid,
  CircularProgress,
  Typography,
  Button,
  TextField
} from "@material-ui/core";

import Notification from "../../components/Notification/Notification";
import { Close as CloseIcon } from "@material-ui/icons";

import { withRouter } from "react-router-dom";

import useStyles from "./styles";

import { useForm, Controller } from 'react-hook-form';

import { useUserDispatch, resetPassword } from "../../context/UserContext";

import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

function ForgetPassword(props) {

  const classes = useStyles();

  const { handleSubmit, control, watch } = useForm();
  const password = useRef({});
  password.current = watch("newPassword", "");

  const userDispatch = useUserDispatch();

  const [resetPasswordLoading, setResetPasswordLoading] = useState(false);
  const [error, setError] = useState(null);
  const [passwordReset, setPasswordReset] = useState(false);

  const { user, token } = useParams();
  
  const onSubmit = async (data) => {

    if(!!user && !!token){
      await resetPassword(userDispatch, data.newPassword, user, token, props.history, setPasswordReset, setError, setResetPasswordLoading);
    }

  };

  useEffect(() => {
    function sendNotification(componentProps, options) {
      return toast(
        <Notification
          {...componentProps}
          className={classes.notificationComponent}
        />,
        options,
      );
    }

    const error_options = {
      type: "error",
      position: toast.POSITION.TOP_RIGHT,
      progressClassName: classes.progress,
      onClose: () => { setResetPasswordLoading(false) },
      className: classes.notification,
    }

    if (error && !passwordReset) {
      setResetPasswordLoading(true);
      setPasswordReset(false);
      sendNotification({
        type: "defence",
        message: "Erro ao reiniciar senha!",
        variant: "contained",
        color: "secondary"
      }, error_options);
    }

    if (passwordReset && !error) {
      setResetPasswordLoading(true);
      setError(false);
      setPasswordReset(false);
      sendNotification({
        type: "message",
        message: "Senha alterada com sucesso!",
        variant: "contained",
        color: "primary"
      }, error_options);
    }

  }, [error, passwordReset, classes]);

  function CloseButton({ closeToast, className }) {
    return <CloseIcon className={className} onClick={closeToast} />;
  }

  return (
    <Grid container className={classes.container}>
      <div className={classes.logotypeContainer}>

      </div>
      <div className={classes.formContainer}>

        <ToastContainer
          className={classes.toastsContainer}
          closeButton={
            <CloseButton className={classes.notificationCloseButton} />
          }
          closeOnClick={false}
          progressClassName={classes.notificationProgress}
        />

        <div className={classes.form}>
          <React.Fragment>
            <Typography variant="h3" className={classes.greeting}>
              Nova Senha
            </Typography>
            <form onSubmit={handleSubmit(onSubmit)}>

              <Controller
                name={"newPassword"}
                control={control}
                defaultValue=""
                render={({ field: { onChange, value }, fieldState: { error } }) => (
                  <TextField
                    autoFocus
                    margin="normal"
                    label="Nova senha"
                    fullWidth
                    variant="standard"
                    type="password"
                    error={!!error}
                    helperText={error ? error.message : null}
                    value={value}
                    onChange={onChange}
                  />
                )}
                rules={{
                  required: "Nova senha necessária",
                  minLength: {
                    value: 8,
                    message: "Mínimo de 8 caracteres"
                  }
                }}
              />

              <Controller
                name={"newPasswordConfirmation"}
                control={control}
                defaultValue=""
                render={({ field: { onChange, value }, fieldState: { error } }) => (
                  <TextField
                    margin="normal"
                    label="Confirmação da senha"
                    fullWidth
                    variant="standard"
                    type="password"
                    error={!!error}
                    helperText={error ? error.message : null}
                    value={value}
                    onChange={onChange}
                  />
                )}
                rules={{
                  required: "Confirmação de senha necessária",
                  minLength: {
                    value: 8,
                    message: "Mínimo de 8 caracteres"
                  }, 
                  validate: value => 
                    value === password.current || "As senhas não coincidem"
                }}
              />

              <div className={classes.formButtons}>
                {resetPasswordLoading ? (
                  <CircularProgress size={26} className={classes.loginLoader} />
                ) : (
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    size="large"
                    fullWidth={true}
                  >
                    Alterar Senha
                  </Button>
                )}
              </div>
            </form>
          </React.Fragment>
        </div>

        <Typography color="primary" className={classes.copyright}>
          © {new Date().getFullYear()} <a style={{ textDecoration: 'none', color: 'inherit' }} href="https://www.competengenharia.com.br/" rel="noopener noreferrer" target="_blank">Compet Engenharia</a>.
        </Typography>
      </div>
    </Grid>
  );
}

export default withRouter(ForgetPassword);

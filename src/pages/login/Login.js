import React, { useEffect, useState } from "react";
import {
  Grid,
  CircularProgress,
  Typography,
  Button,
  TextField,
} from "@material-ui/core";

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

import Notification from "../../components/Notification";
import { Close as CloseIcon } from "@material-ui/icons";

import { withRouter } from "react-router-dom";

import useStyles from "./styles";

import { useUserDispatch, loginUser, forgetPassword } from "../../context/UserContext";

import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

import { useForm, Controller } from 'react-hook-form';

function Login(props) {

  const classes = useStyles();

  const { handleSubmit, control } = useForm();
  const userForm = useForm();

  const userDispatch = useUserDispatch();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [passwordForget, setPasswordForget] = useState(false);
  const [open, setOpen] = useState(false);
  const [forgetLoading, setForgetLoading] = useState(false);
  const [errorForgetPassword, setErrorForgetPassword] = useState(false);

  const handleSubmitForgetPassword = userForm.handleSubmit;
  const controlForgetPassword = userForm.control;

  const handleClickOpen = () => {
    setForgetLoading(false);
    setErrorForgetPassword(false);
    setPasswordForget(false);
    setError(null);
    setOpen(true);
  };

  const handleClose = () => {
    setForgetLoading(false);
    setErrorForgetPassword(false);
    setOpen(false);
    setPasswordForget(false);
    setError(null);
  };

  const onSubmit = async (data) => {
    console.log(data);
    await forgetPassword(userDispatch, data.emailPasswordReset, props.history, setError, setPasswordForget, setOpen, setForgetLoading, setErrorForgetPassword);
  };

  const onSubmitLogin = async (data) => {
    await loginUser(
      userDispatch,
      data.login,
      data.password,
      props.history,
      setIsLoading,
      setError,
      setPasswordForget
    );
  }

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
      onClose: () => { setIsLoading(false); setForgetLoading(false) },
      className: classes.notification,
    }

    if (error && !passwordForget && !errorForgetPassword) {
      setForgetLoading(false);
      setIsLoading(true);
      setPasswordForget(false);
      sendNotification({
        type: "defence",
        message: "Login ou senha incorretos",
        variant: "contained",
        color: "secondary"
      }, error_options);
    }

    if (passwordForget && !error && !errorForgetPassword) {
      setIsLoading(true);
      setError(null);
      setPasswordForget(false);
      sendNotification({
        type: "message",
        message: "E-mail enviado com sucesso",
        variant: "contained",
        color: "primary"
      }, error_options);
    }

    if (errorForgetPassword && !passwordForget && !error) {
      console.log('dados', errorForgetPassword, passwordForget, error)
      setIsLoading(false);
      setError(null);
      setPasswordForget(false);
      sendNotification({
        type: "defence",
        message: "Erro ao enviar e-mail para o usuário!",
        variant: "contained",
        color: "secondary"
      }, error_options);
    }

  }, [error, passwordForget, classes, errorForgetPassword]);

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
              Controle de Vencimentos
            </Typography>

            <form onSubmit={handleSubmit(onSubmitLogin)}>

              <Controller
                name={"login"}
                control={control}
                defaultValue=""
                render={({ field: { onChange, value }, fieldState: { error } }) => (
                  <TextField
                    autoFocus
                    margin="normal"
                    label="E-mail"
                    fullWidth
                    variant="standard"
                    type="email"
                    error={!!error}
                    helperText={error ? error.message : null}
                    value={value}
                    onChange={onChange}
                  />
                )}
                rules={{
                  required: "Favor fornecer o e-mail para o login"
                }}
              />

              <Controller
                name={"password"}
                control={control}
                defaultValue=""
                render={({ field: { onChange, value }, fieldState: { error } }) => (
                  <TextField
                    margin="normal"
                    label="Senha"
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
                  required: "Insira a sua senha",
                  minLength: {
                    value: 8,
                    message: "A senha possui pelo menos 8 caracteres"
                  }
                }}
              />

              <div className={classes.formButtons}>
                {isLoading ? (
                  <CircularProgress size={26} className={classes.loginLoader} />
                ) : (
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    size="large"
                  >
                    Login
                  </Button>
                )}
                <Button
                  color="primary"
                  size="large"
                  className={classes.forgetButton}
                  onClick={handleClickOpen}
                >
                  Esqueci minha senha
                </Button>
              </div>
            </form>
          </React.Fragment>
        </div>

        <Typography color="primary" className={classes.copyright}>
          © {new Date().getFullYear()} <a style={{ textDecoration: 'none', color: 'inherit' }} href="https://www.competengenharia.com.br/" rel="noopener noreferrer" target="_blank">Compet Engenharia</a>.
        </Typography>
      </div>

      <Dialog open={open} onClose={handleClose}>
        <form onSubmit={handleSubmitForgetPassword(onSubmit)}>
          <DialogTitle>Esqueceu sua senha?</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Para reiniciar sua senha, informe o e-mail cadastrado. Você receberá um e-mail com as instrução de mudança de senha.
            </DialogContentText>

            <Controller
              name={"emailPasswordReset"}
              control={controlForgetPassword}
              defaultValue=""
              render={({ field: { onChange, value }, fieldState: { error } }) => (
                <TextField
                  autoFocus
                  margin="normal"
                  label="Endereço de e-mail"
                  fullWidth
                  variant="standard"
                  error={!!error}
                  helperText={error ? error.message : null}
                  value={value}
                  onChange={onChange}
                />
              )}
              rules={{
                required: "E-mail necessário",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "E-mail inválido"
                }
              }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => {
              handleClose();
            }}>Cancelar</Button>
            {forgetLoading ? (
              <CircularProgress size={26} className={classes.loginLoader} />
            ) :
              <Button color="primary" type="submit">Enviar e-mail</Button>
            }
          </DialogActions>
        </form>
      </Dialog>
    </Grid>
  );
}

export default withRouter(Login);

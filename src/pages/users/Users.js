import React, { useEffect } from "react";
import {
    Grid,
    Button,
    TextField,
    CircularProgress,
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from "@material-ui/core";
import MUIDataTable from "mui-datatables";

import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

import Notification from "../../components/Notification";
import { Close as CloseIcon } from "@material-ui/icons";

import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

import { useForm, Controller } from 'react-hook-form';

import useStyles from "./styles";

import PageTitle from "../../components/PageTitle";

import api from '../../services/ApiService';

import jwt_decode from "jwt-decode";

import VerifyToken from "../../components/VerifyToken";

export default function Users(props) {

    const [users, setUsers] = React.useState([]);
    const [open, setOpen] = React.useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(false);
    const [isDeleteLoading, setIsDeleteLoading] = React.useState(false);
    const [action, setAction] = React.useState("");
    const [userToDelete, setUserToDelete] = React.useState("");

    const { handleSubmit, control, reset, setValue } = useForm();
    
    const classes = useStyles();

    const userData = jwt_decode(localStorage.getItem("@compet-expiration-control"));
    console.log(userData);

    const handleClose = () => {
        setOpen(false);
    };

    const handleCloseDeleteDialog = () => {
        setOpenDeleteDialog(false);
    }

    function sendNotification(componentProps, options) {
        return toast(
            <Notification
                {...componentProps}
                className={classes.notificationComponent}
            />,
            options,
        );
    }

    const handleDeleteUser = async () => {

        setIsDeleteLoading(true);

        if (userToDelete !== "") {
            if(userToDelete === userData.user_id){
                sendNotification({
                    type: "message",
                    message: "Voc?? n??o pode se deletar do sistema!",
                    variant: "contained",
                    color: "secondary"
                }, notification_options);
                setTimeout(() => {
                    setIsDeleteLoading(false);
                    setOpenDeleteDialog(false);
                }, 3000);
                return;
            }

            try {
                const userDeleteResponse = await api.delete(`/user/${userToDelete}`);
                if (userDeleteResponse) {
                    sendNotification({
                        type: "message",
                        message: "Usu??rio deletado com sucesso!",
                        variant: "contained",
                        color: "primary"
                    }, notification_options);
                    setTimeout(() => {
                        setIsDeleteLoading(false);
                        setOpenDeleteDialog(false);
                    }, 3000);
                } else {
                    sendNotification({
                        type: "message",
                        message: "Erro ao deletar usu??rio!",
                        variant: "contained",
                        color: "secondary"
                    }, notification_options);
                    setTimeout(() => {
                        setIsDeleteLoading(false);
                    }, 3000);
                }
            } catch (error) {
                sendNotification({
                    type: "message",
                    message: "Erro ao deletar usu??rio!",
                    variant: "contained",
                    color: "secondary"
                }, notification_options);
                setTimeout(() => setIsDeleteLoading(false), 3000);
            }
        }
    }

    const notification_options = {
        type: "error",
        position: toast.POSITION.TOP_RIGHT,
        progressClassName: classes.progress,
        onClose: () => { setIsLoading(false); },
        className: classes.notification,
    }

    function CloseButton({ closeToast, className }) {
        return <CloseIcon className={className} onClick={closeToast} />;
    }

    const onSubmit = async (data) => {
        console.log(data);
        setIsLoading(true);
        try {
            if (action === "add") {
                const userAddResponse = await api.post('/user', {
                    user_name: data.userName,
                    user_email: data.userEmail,
                    user_login: data.userLogin,
                    user_type: data.userType,
                    user_status: data.userStatus
                });

                console.log(userAddResponse);

                if (userAddResponse) {
                    sendNotification({
                        type: "message",
                        message: "Usu??rio criado com sucesso!",
                        variant: "contained",
                        color: "primary"
                    }, notification_options);
                    setTimeout(() => setOpen(false), 3000);
                } else {
                    sendNotification({
                        type: "defence",
                        message: "Erro ao criar usu??rio",
                        variant: "contained",
                        color: "secondary"
                    }, notification_options);
                }

            } else if (action === "update") {
                const userUpdateResponse = await api.patch(`/user/${data.userId}`, {
                    user_name: data.userName,
                    user_email: data.userEmail,
                    user_login: data.userLogin,
                    user_type: data.userType,
                    user_status: data.userStatus
                });

                console.log(userUpdateResponse);

                if (userUpdateResponse) {
                    sendNotification({
                        type: "message",
                        message: "Usu??rio atualizado com sucesso!",
                        variant: "contained",
                        color: "primary"
                    }, notification_options);
                    setTimeout(() => setOpen(false), 3000);
                } else {
                    sendNotification({
                        type: "defence",
                        message: "Erro ao atualizar usu??rio",
                        variant: "contained",
                        color: "secondary"
                    }, notification_options);
                }
            }
        } catch (error) {
            console.log(error.message);
            if (action === "add") {
                sendNotification({
                    type: "defence",
                    message: "Erro ao criar usu??rio",
                    variant: "contained",
                    color: "secondary"
                }, notification_options);
            } else if (action === "update") {
                sendNotification({
                    type: "defence",
                    message: "Erro ao atualizar usu??rio",
                    variant: "contained",
                    color: "secondary"
                }, notification_options);
            }
        }
    }

    useEffect(() => {
        if (open === false || openDeleteDialog === false) {
            (async () => {
                try {
                    const response = await api.get('/users');
                    console.log(response.data);
                    setUsers(response.data.users.map(user => [
                        user.user_id,
                        user.user_name,
                        user.user_email,
                        user.user_login,
                        user.user_type === "administrator" ? "Administrador" : user.user_type === "operator" ? "Operador" : "Visualizador",
                        user.user_status === "active" ? "Ativo" : "Inativo"
                    ]));
                } catch (error) {
                    setUsers(null);
                    console.log(error);
                }
            })();
        }
    }, [open, openDeleteDialog])

    return (
        <>

            <VerifyToken props={props} />

            <ToastContainer
                className={classes.toastsContainer}
                closeButton={
                    <CloseButton className={classes.notificationCloseButton} />
                }
                closeOnClick={false}
                progressClassName={classes.notificationProgress}
            />

            <PageTitle title="Usu??rios" button={<Button
                variant="contained"
                size="medium"
                color="primary"
                onClick={() => {
                    setAction("add");
                    setOpen(true);
                    reset();
                }}
            >
                Adicionar
            </Button>} />
            <Grid container spacing={4}>
                <Grid item xs={12}>
                    <MUIDataTable
                        title="Lista de Usu??rios"
                        data={users}
                        columns={[{ name: "Id", options: { display: "excluded", filter: false, sort: false } }, "Nome", "E-mail", "Login", "Perfil", "Situa????o", {
                            name: "A????es",
                            options: {
                                filter: false,
                                sort: false,
                                customBodyRender: (value, tableMeta, updateValue) => {
                                    return (
                                        <React.Fragment>
                                            <IconButton color="primary" aria-label="Alterar usu??rio" onClick={() => {
                                                setAction("update");
                                                setOpen(true);
                                                setValue("userId", tableMeta.rowData[0]);
                                                setValue("userName", tableMeta.rowData[1], {
                                                    shouldValidate: true
                                                });
                                                setValue("userLogin", tableMeta.rowData[3], {
                                                    shouldValidate: true
                                                });
                                                setValue("userEmail", tableMeta.rowData[2], {
                                                    shouldValidate: true
                                                });
                                                setValue("userType", tableMeta.rowData[4] === "Administrador" ? "administrator" : tableMeta.rowData[4] === "Operador" ? "operator" : "viewer", {
                                                    shouldValidate: true
                                                });
                                                setValue("userStatus", tableMeta.rowData[5] === "Ativo" ? "active" : "inactive", {
                                                    shouldValidate: true
                                                })

                                            }}>
                                                <ManageAccountsIcon />
                                            </IconButton>
                                            <IconButton color="error" aria-label="Deletar usu??rio" onClick={() => {
                                                setAction("delete");
                                                setOpenDeleteDialog(true);
                                                setUserToDelete(tableMeta.rowData[0]);
                                            }
                                            }>
                                                <DeleteIcon />
                                            </IconButton>
                                        </React.Fragment>
                                    )
                                }
                            }
                        }]}
                        options={{
                            filterType: "checkbox",
                            selectableRowsHideCheckboxes: true
                        }}
                    />
                </Grid>

                <div>
                    <Dialog
                        open={openDeleteDialog}
                        onClose={handleCloseDeleteDialog}
                        aria-labelledby="alert-dialog-title"
                        aria-describedby="alert-dialog-description"
                    >
                        <DialogTitle id="alert-dialog-title">
                            {"Exclus??o de usu??rio"}
                        </DialogTitle>
                        <DialogContent>
                            <DialogContentText id="alert-dialog-description">
                                Tem certeza que deseja deletar o usu??rio?
                            </DialogContentText>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleCloseDeleteDialog}>N??o</Button>
                            {isDeleteLoading ? (
                                <CircularProgress size={26} className={classes.loginLoader} />
                            ) :
                                <Button color="secondary" onClick={handleDeleteUser} autoFocus>
                                    Sim
                                </Button>
                            }

                        </DialogActions>
                    </Dialog>
                </div>

                <Dialog open={open} onClose={handleClose}>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <DialogTitle>Adicionar Usu??rio</DialogTitle>
                        <DialogContent>
                            <DialogContentText>
                                Insira aqui as informa????es do novo usu??rio:
                            </DialogContentText>

                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <Controller
                                        name={"userId"}
                                        control={control}
                                        render={({ field: { onChange, value } }) => (
                                            <TextField
                                                disabled={true}
                                                value={value}
                                                onChange={onChange}
                                                className={classes.textFieldHidden}
                                            />
                                        )}
                                    />
                                    <Controller
                                        name={"userName"}
                                        control={control}
                                        defaultValue=""
                                        render={({ field: { onChange, value }, fieldState: { error } }) => (
                                            <TextField
                                                autoFocus
                                                margin="normal"
                                                label="Nome do usu??rio"
                                                fullWidth
                                                variant="standard"
                                                error={!!error}
                                                helperText={error ? error.message : null}
                                                value={value}
                                                onChange={onChange}
                                            />
                                        )}
                                        rules={{
                                            required: "Insira um nome do usu??rio",
                                            minLength: {
                                                value: 6,
                                                message: "O nome deve ter no m??nimo 6 caracteres"
                                            }
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <Controller
                                        name={"userLogin"}
                                        control={control}
                                        defaultValue=""
                                        render={({ field: { onChange, value }, fieldState: { error } }) => (
                                            <TextField
                                                margin="normal"
                                                label="Login do usu??rio"
                                                fullWidth
                                                variant="standard"
                                                error={!!error}
                                                helperText={error ? error.message : null}
                                                value={value}
                                                onChange={onChange}
                                            />
                                        )}
                                        rules={{
                                            required: "Insira um login para o usu??rio",
                                            minLength: {
                                                value: 6,
                                                message: "O login deve ter no m??nimo 6 caracteres"
                                            }
                                        }}
                                    />
                                </Grid>
                            </Grid>

                            <Controller
                                name={"userEmail"}
                                control={control}
                                defaultValue=""
                                render={({ field: { onChange, value }, fieldState: { error } }) => (
                                    <TextField
                                        margin="normal"
                                        label="Email do usu??rio"
                                        fullWidth
                                        variant="standard"
                                        error={!!error}
                                        helperText={error ? error.message : null}
                                        value={value}
                                        onChange={onChange}
                                    />
                                )}
                                rules={{
                                    required: "Insira um nome do usu??rio",
                                    pattern: {
                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                        message: "E-mail inv??lido"
                                    }
                                }}
                            />

                            <Grid container spacing={2}>
                                <Grid item xs={6}>
                                    <Controller
                                        name={"userType"}
                                        control={control}
                                        defaultValue=""
                                        render={({ field: { onChange, value }, fieldState: { error } }) => (
                                            <FormControl fullWidth>
                                                <InputLabel id="userType">Perfil do usu??rio</InputLabel>
                                                <Select
                                                    labelId="userType"
                                                    id="userType"
                                                    value={value}
                                                    label="Perfil do usu??rio"
                                                    onChange={onChange}
                                                    error={!!error}
                                                >
                                                    <MenuItem value={'administrator'}>Administrador</MenuItem>
                                                    <MenuItem value={'operator'}>Operador</MenuItem>
                                                    <MenuItem value={'viewer'}>Visualizador</MenuItem>
                                                </Select>
                                            </FormControl>
                                        )}
                                        rules={{
                                            required: "Insira um perfil para o usu??rio"
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <Controller
                                        name={"userStatus"}
                                        control={control}
                                        defaultValue=""
                                        render={({ field: { onChange, value }, fieldState: { error } }) => (
                                            <FormControl fullWidth>
                                                <InputLabel id="userType">Situa????o do usu??rio</InputLabel>
                                                <Select
                                                    labelId="userType"
                                                    id="userType"
                                                    value={value}
                                                    label="Situa????o do usu??rio"
                                                    onChange={onChange}
                                                    error={!!error}
                                                >
                                                    <MenuItem value={'active'}>Ativo</MenuItem>
                                                    <MenuItem value={'inactive'}>Inativo</MenuItem>
                                                </Select>
                                            </FormControl>
                                        )}
                                        rules={{
                                            required: "Insira a situa????o do usu??rio"
                                        }}
                                    />
                                </Grid>
                            </Grid>

                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => {
                                handleClose();
                            }}>Cancelar</Button>
                            {isLoading ? (
                                <CircularProgress size={26} className={classes.loginLoader} />
                            ) :
                                <Button color="primary" type="submit">{action === "add" ? "Cadastrar usu??rio" : "Atualizar usu??rio"}</Button>
                            }
                        </DialogActions>
                    </form>
                </Dialog>
            </Grid>
        </>
    );
}

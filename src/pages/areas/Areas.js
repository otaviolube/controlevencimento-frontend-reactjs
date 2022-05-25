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

export default function Areas(props) {

    const [areas, setAreas] = React.useState([]);
    const [open, setOpen] = React.useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(false);
    const [isDeleteLoading, setIsDeleteLoading] = React.useState(false);
    const [action, setAction] = React.useState("");
    const [areaToDelete, setAreaToDelete] = React.useState("");

    const { handleSubmit, control, reset, setValue } = useForm();

    const classes = useStyles();

    const userData = jwt_decode(localStorage.getItem("@compet-expiration-control"));
    console.log(userData);

    function CloseButton({ closeToast, className }) {
        return <CloseIcon className={className} onClick={closeToast} />;
    }

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

    const notification_options = {
        type: "error",
        position: toast.POSITION.TOP_RIGHT,
        progressClassName: classes.progress,
        onClose: () => { setIsLoading(false); },
        className: classes.notification,
    }

    const onSubmit = async (data) => {
        console.log(data);
        setIsLoading(true);
        try {
            if (action === "add") {
                const areaAddResponse = await api.post('/area', {
                    area_name: data.areaName,
                    area_email: data.areaEmail,
                    area_status: data.areaStatus
                });

                console.log(areaAddResponse);

                if (areaAddResponse) {
                    sendNotification({
                        type: "message",
                        message: "Área criada com sucesso!",
                        variant: "contained",
                        color: "primary"
                    }, notification_options);
                    setTimeout(() => setOpen(false), 3000);
                } else {
                    sendNotification({
                        type: "defence",
                        message: "Erro ao criar área",
                        variant: "contained",
                        color: "secondary"
                    }, notification_options);
                }

            } else if (action === "update") {
                const areaUpdateResponse = await api.patch(`/area/${data.areaId}`, {
                    area_name: data.areaName,
                    area_email: data.areaEmail,
                    area_login: data.areaStatus
                });

                console.log(areaUpdateResponse);

                if (areaUpdateResponse) {
                    sendNotification({
                        type: "message",
                        message: "Área atualizada com sucesso!",
                        variant: "contained",
                        color: "primary"
                    }, notification_options);
                    setTimeout(() => setOpen(false), 3000);
                } else {
                    sendNotification({
                        type: "defence",
                        message: "Erro ao atualizar área",
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
                    message: "Erro ao criar área",
                    variant: "contained",
                    color: "secondary"
                }, notification_options);
            } else if (action === "update") {
                sendNotification({
                    type: "defence",
                    message: "Erro ao atualizar área",
                    variant: "contained",
                    color: "secondary"
                }, notification_options);
            }
        }
    }

    const handleDeleteArea = async () => {

        setIsDeleteLoading(true);

        if (areaToDelete !== "") {
            try {
                const areaDeleteResponse = await api.delete(`/area/${areaToDelete}`);
                if (areaDeleteResponse) {
                    sendNotification({
                        type: "message",
                        message: "Área deletada com sucesso!",
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
                        message: "Erro ao deletar área!",
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
                    message: "Erro ao deletar área!",
                    variant: "contained",
                    color: "secondary"
                }, notification_options);
                setTimeout(() => setIsDeleteLoading(false), 3000);
            }
        }
    }

    useEffect(() => {
        if (open === false || openDeleteDialog === false) {
            (async () => {
                try {
                    const response = await api.get('/areas');
                    console.log(response.data);
                    setAreas(response.data.areas.map(area => [
                        area.area_id,
                        area.area_name,
                        area.area_email,
                        area.area_status === "active" ? "Ativa" : "Inativa"
                    ]));
                } catch (error) {
                    setAreas(null);
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

            <PageTitle title="Áreas" button={<Button
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

            <Grid item xs={12}>
                <MUIDataTable
                    title="Lista de Áreas"
                    data={areas}
                    columns={[{ name: "Id", options: { display: "excluded", filter: false, sort: false } }, "Nome", "E-mail", "Situação", {
                        name: "Ações",
                        options: {
                            filter: false,
                            sort: false,
                            customBodyRender: (value, tableMeta, updateValue) => {
                                return (
                                    <React.Fragment>
                                        <IconButton color="primary" aria-label="Alterar área" onClick={() => {
                                            setAction("update");
                                            setOpen(true);
                                            setValue("areaId", tableMeta.rowData[0]);
                                            setValue("areaName", tableMeta.rowData[1], {
                                                shouldValidate: true
                                            });
                                            setValue("areaEmail", tableMeta.rowData[2], {
                                                shouldValidate: true
                                            });
                                            setValue("areaStatus", tableMeta.rowData[4] === "Ativa" ? "active" : "inactive", {
                                                shouldValidate: true
                                            })

                                        }}>
                                            <ManageAccountsIcon />
                                        </IconButton>
                                        <IconButton color="error" aria-label="Deletar área" onClick={() => {
                                            setAction("delete");
                                            setOpenDeleteDialog(true);
                                            setAreaToDelete(tableMeta.rowData[0]);
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

            <Dialog
                open={openDeleteDialog}
                onClose={handleCloseDeleteDialog}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    {"Exclusão de área"}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Tem certeza que deseja deletar a área?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDeleteDialog}>Não</Button>
                    {isDeleteLoading ? (
                        <CircularProgress size={26} className={classes.loginLoader} />
                    ) :
                        <Button color="secondary" onClick={handleDeleteArea} autoFocus>
                            Sim
                        </Button>
                    }

                </DialogActions>
            </Dialog>

            <Dialog open={open} onClose={handleClose}>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <DialogTitle>Adicionar Área</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Insira aqui as informações da nova área:
                        </DialogContentText>

                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <Controller
                                    name={"areaId"}
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
                                    name={"areaName"}
                                    control={control}
                                    defaultValue=""
                                    render={({ field: { onChange, value }, fieldState: { error } }) => (
                                        <TextField
                                            autoFocus
                                            margin="normal"
                                            label="Nome da área"
                                            fullWidth
                                            variant="standard"
                                            error={!!error}
                                            helperText={error ? error.message : null}
                                            value={value}
                                            onChange={onChange}
                                        />
                                    )}
                                    rules={{
                                        required: "Insira o nome da área",
                                        minLength: {
                                            value: 2,
                                            message: "O nome deve ter no mínimo 2 caracteres"
                                        }
                                    }}
                                />
                            </Grid>
                        </Grid>

                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <Controller
                                    name={"areaEmail"}
                                    control={control}
                                    defaultValue=""
                                    render={({ field: { onChange, value }, fieldState: { error } }) => (
                                        <TextField
                                            margin="normal"
                                            label="Email da área"
                                            fullWidth
                                            variant="standard"
                                            error={!!error}
                                            helperText={error ? error.message : null}
                                            value={value}
                                            onChange={onChange}
                                        />
                                    )}
                                    rules={{
                                        pattern: {
                                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                            message: "E-mail inválido"
                                        }
                                    }}
                                />
                            </Grid>
                        </Grid>

                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <Controller
                                    name={"areaStatus"}
                                    control={control}
                                    defaultValue=""
                                    render={({ field: { onChange, value }, fieldState: { error } }) => (
                                        <FormControl fullWidth>
                                            <InputLabel id="areaStatus">Situação da área</InputLabel>
                                            <Select
                                                labelId="areaStatus"
                                                id="areaStatus"
                                                value={value}
                                                label="Situação da área"
                                                onChange={onChange}
                                                error={!!error}
                                            >
                                                <MenuItem value={'active'}>Ativa</MenuItem>
                                                <MenuItem value={'inactive'}>Inativa</MenuItem>
                                            </Select>
                                        </FormControl>
                                    )}
                                    rules={{
                                        required: "Insira a situação da área"
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
                            <Button color="primary" type="submit">{action === "add" ? "Cadastrar área" : "Atualizar área"}</Button>
                        }
                    </DialogActions>
                </form>
            </Dialog>

        </>
    );
}

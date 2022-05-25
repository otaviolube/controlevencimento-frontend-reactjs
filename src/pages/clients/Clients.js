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

import { Autocomplete } from '@mui/material';

import MUIDataTable from "mui-datatables";

import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import InfoIcon from '@mui/icons-material/Info';

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

export default function Clients(props) {

    const [clients, setClients] = React.useState([]);
    const [open, setOpen] = React.useState(false);
    const [openCompanies, setOpenCompanies] = React.useState(false);
    const [optionsCompanies, setOptionCompanies] = React.useState([]);
    const [openDeleteDialog, setOpenDeleteDialog] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(false);
    const [isDeleteLoading, setIsDeleteLoading] = React.useState(false);
    const [action, setAction] = React.useState("");
    const [clientToDelete, setClientToDelete] = React.useState("");

    const loadingCompanies = openCompanies && optionsCompanies.length === 0;

    const { handleSubmit, control, reset, setValue } = useForm();

    const classes = useStyles();

    const userData = jwt_decode(localStorage.getItem("@compet-expiration-control"));
    console.log(userData);

    function CloseButton({ closeToast, className }) {
        return <CloseIcon className={className} onClick={closeToast} />;
    }

    const handleCloseDeleteDialog = () => {
        setOpenDeleteDialog(false);
    }

    const handleClose = () => {
        setOpen(false);
    };

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
                const clientAddResponse = await api.post('/client', {
                    client_name: data.clientName,
                    client_status: data.clientStatus,
                    company_id: data.companyId
                });

                console.log(clientAddResponse);

                if (clientAddResponse) {
                    sendNotification({
                        type: "message",
                        message: "Cliente criado com sucesso!",
                        variant: "contained",
                        color: "primary"
                    }, notification_options);
                    setTimeout(() => setOpen(false), 3000);
                } else {
                    sendNotification({
                        type: "defence",
                        message: "Erro ao criar o cliente",
                        variant: "contained",
                        color: "secondary"
                    }, notification_options);
                }

            } else if (action === "update") {
                const clientUpdateResponse = await api.patch(`/client/${data.clientId}`, {
                    client_name: data.clientName,
                    client_status: data.clientStatus,
                    company_id: data.companyId
                });

                console.log(clientUpdateResponse);

                if (clientUpdateResponse) {
                    sendNotification({
                        type: "message",
                        message: "Cliente atualizado com sucesso!",
                        variant: "contained",
                        color: "primary"
                    }, notification_options);
                    setTimeout(() => setOpen(false), 3000);
                } else {
                    sendNotification({
                        type: "defence",
                        message: "Erro ao atualizar o cliente",
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
                    message: "Erro ao criar o cliente",
                    variant: "contained",
                    color: "secondary"
                }, notification_options);
            } else if (action === "update") {
                sendNotification({
                    type: "defence",
                    message: "Erro ao atualizar o cliente",
                    variant: "contained",
                    color: "secondary"
                }, notification_options);
            }
        }
    }

    const handleDeleteClient = async () => {

        setIsDeleteLoading(true);

        if (clientToDelete !== "") {
            try {
                const clientToDeleteResponse = await api.delete(`/client/${clientToDelete}`);
                if (clientToDeleteResponse) {
                    sendNotification({
                        type: "message",
                        message: "Cliente deletado com sucesso!",
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
                        message: "Erro ao deletar cliente!",
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
                    message: "Erro ao deletar cliente!",
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
                    const response = await api.get('/clients');
                    console.log(response.data);
                    setClients(response.data.clients.map(client => [
                        client.client_id,
                        client.company_id,
                        client.client_name,
                        client.company.company_name,
                        client.client_status === "active" ? "Ativo" : "Inativo"
                    ]));
                } catch (error) {
                    setClients(null);
                    console.log(error);
                }
            })();
        }
    }, [open, openDeleteDialog]);

    useEffect(() => {
        let active = true;

        if (!loadingCompanies) {
            return undefined;
        }

        (async () => {
            let response = await api.get('/companies');
            console.log(response.data.companies);
            if (active) {
                setOptionCompanies([...response.data.companies]);
            }
        })();

        return () => {
            active = false;
        }

    }, [loadingCompanies])

    useEffect(() => {
        if (!openCompanies) {
            setOptionCompanies([]);
        }
    }, [openCompanies])

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

            <PageTitle title="Clientes" button={<Button
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
                    title="Lista de Clientes"
                    data={clients}
                    columns={[{ name: "clientId", options: { display: "excluded", filter: false, sort: false } }, { name: "companyId", options: { display: "excluded", filter: false, sort: false } }, "Nome", "Empresa","Status", {
                        name: "Ações",
                        options: {
                            filter: false,
                            sort: false,
                            customBodyRender: (value, tableMeta, updateValue) => {
                                return (
                                    <React.Fragment>
                                        <IconButton arial-label="Visualizar detalhes" onClick={() => {

                                        }}>
                                            <InfoIcon />
                                        </IconButton>
                                        <IconButton color="primary" aria-label="Alterar cliente" onClick={() => {
                                            setAction("update");
                                            setOpen(true);
                                            setValue("clientId", tableMeta.rowData[0]);
                                            setValue("companyId", tableMeta.rowData[1]);
                                            setValue("clientName", tableMeta.rowData[2], {
                                                shouldValidate: true
                                            });
                                            setValue("clientStatus", tableMeta.rowData[4] === "Ativo" ? "active" : "inactive", {
                                                shouldValidate: true
                                            })

                                        }}>
                                            <ManageAccountsIcon />
                                        </IconButton>
                                        <IconButton color="error" aria-label="Deletar subitem" onClick={() => {
                                            setAction("delete");
                                            setOpenDeleteDialog(true);
                                            setClientToDelete(tableMeta.rowData[0]);
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
                    {"Exclusão de cliente"}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Tem certeza que deseja deletar esse cliente?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDeleteDialog}>Não</Button>
                    {isDeleteLoading ? (
                        <CircularProgress size={26} className={classes.loginLoader} />
                    ) :
                        <Button color="secondary" onClick={handleDeleteClient} autoFocus>
                            Sim
                        </Button>
                    }
                </DialogActions>
            </Dialog>

            <Dialog open={open} onClose={handleClose}>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <DialogTitle>Adicionar Cliente</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Insira aqui as informações do novo cliente:
                        </DialogContentText>

                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <Controller
                                    name={"clienteId"}
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
                                    name={"companyId"}
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
                                    name={"clientName"}
                                    control={control}
                                    defaultValue=""
                                    render={({ field: { onChange, value }, fieldState: { error } }) => (
                                        <TextField
                                            autoFocus
                                            margin="normal"
                                            label="Nome do cliente"
                                            fullWidth
                                            variant="standard"
                                            error={!!error}
                                            helperText={error ? error.message : null}
                                            value={value}
                                            onChange={onChange}
                                        />
                                    )}
                                    rules={{
                                        required: "Insira o nome do cliente",
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
                                    name={"clienteCompanyname"}
                                    control={control}
                                    render={({ field: { onChange, value } }) => (
                                        <Autocomplete
                                            id="companies"
                                            open={openCompanies}
                                            onOpen={() => {
                                                setOpenCompanies(true);
                                            }}
                                            onClose={() => {
                                                setOpenCompanies(false);
                                            }}
                                            isOptionEqualToValue={(option, value) => option.company_name === value.company_name}
                                            getOptionLabel={(option) => {
                                                console.log(option)
                                                return option.company_name
                                            }}
                                            options={optionsCompanies}
                                            loading={loadingCompanies}
                                            onChange={(_, value) => {
                                                setValue("companyId", value.company_id);
                                                onChange(value.company_name)
                                            }}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    label="Empresa"
                                                    InputProps={{
                                                        ...params.InputProps,
                                                        endAdornment: (
                                                            <React.Fragment>
                                                                {loadingCompanies ? <CircularProgress color="inherit" size={20} /> : null}
                                                                {params.InputProps.endAdornment}
                                                            </React.Fragment>
                                                        ),
                                                    }}
                                                />
                                            )}
                                        />
                                    )}
                                    rules={{
                                        required: "Insira a empresa do cliente",
                                    }}
                                />
                            </Grid>
                        </Grid>

                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <Controller
                                    name={"clientStatus"}
                                    control={control}
                                    defaultValue=""
                                    render={({ field: { onChange, value }, fieldState: { error } }) => (
                                        <FormControl fullWidth>
                                            <InputLabel id="itemStatus">Situação do cliente</InputLabel>
                                            <Select
                                                labelId="clientStatus"
                                                id="clientStatus"
                                                value={value}
                                                label="Situação do cliente"
                                                onChange={onChange}
                                                error={!!error}
                                            >
                                                <MenuItem value={'active'}>Ativo</MenuItem>
                                                <MenuItem value={'inactive'}>Inativo</MenuItem>
                                            </Select>
                                        </FormControl>
                                    )}
                                    rules={{
                                        required: "Insira a situação do cliente"
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
                            <Button color="primary" type="submit">{action === "add" ? "Cadastrar cliente" : "Atualizar cliente"}</Button>
                        }
                    </DialogActions>
                </form>
            </Dialog>
        </>
    );
}

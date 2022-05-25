import React, { useEffect } from "react";

import {
    Grid,
    Button,
    TextField,
    CircularProgress,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
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

export default function Companies(props) {

    const [companies, setCompanies] = React.useState([]);
    const [open, setOpen] = React.useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(false);
    const [isDeleteLoading, setIsDeleteLoading] = React.useState(false);
    const [action, setAction] = React.useState("");
    const [companyToDelete, setCompanyToDelete] = React.useState("");

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
                const companyAddResponse = await api.post('/company', {
                    company_name: data.companyName,
                    company_status: data.companyStatus
                });

                console.log(companyAddResponse);

                if (companyAddResponse) {
                    sendNotification({
                        type: "message",
                        message: "Empresa criada com sucesso!",
                        variant: "contained",
                        color: "primary"
                    }, notification_options);
                    setTimeout(() => setOpen(false), 3000);
                } else {
                    sendNotification({
                        type: "defence",
                        message: "Erro ao criar empresa",
                        variant: "contained",
                        color: "secondary"
                    }, notification_options);
                }

            } else if (action === "update") {
                const companyUpdateResponse = await api.patch(`/company/${data.companyId}`, {
                    company_name: data.companyName,
                    company_status: data.companyStatus
                });

                console.log(companyUpdateResponse);

                if (companyUpdateResponse) {
                    sendNotification({
                        type: "message",
                        message: "Empresa atualizada com sucesso!",
                        variant: "contained",
                        color: "primary"
                    }, notification_options);
                    setTimeout(() => setOpen(false), 3000);
                } else {
                    sendNotification({
                        type: "defence",
                        message: "Erro ao atualizar empresa",
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
                    message: "Erro ao criar empresa",
                    variant: "contained",
                    color: "secondary"
                }, notification_options);
            } else if (action === "update") {
                sendNotification({
                    type: "defence",
                    message: "Erro ao atualizar empresa",
                    variant: "contained",
                    color: "secondary"
                }, notification_options);
            }
        }
    }

    const handleDeleteCompany = async () => {

        setIsDeleteLoading(true);

        if (companyToDelete !== "") {
            try {
                const companyToDeleteResponse = await api.delete(`/company/${companyToDelete}`);
                if (companyToDeleteResponse) {
                    sendNotification({
                        type: "message",
                        message: "Empresa deletada com sucesso!",
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
                        message: "Erro ao deletar empresa!",
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
                    message: "Erro ao deletar empresa!",
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
                    const response = await api.get('/companies');
                    console.log(response.data);
                    setCompanies(response.data.companies.map(company => [
                        company.company_id,
                        company.company_name,
                        company.company_status === "active" ? "Ativa" : "Inativa"
                    ]));
                } catch (error) {
                    setCompanies(null);
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

            <PageTitle title="Empresas" button={<Button
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
                    title="Lista de Empresas"
                    data={companies}
                    columns={[{ name: "Id", options: { display: "excluded", filter: false, sort: false } }, "Nome", "Status", {
                        name: "Ações",
                        options: {
                            filter: false,
                            sort: false,
                            customBodyRender: (value, tableMeta, updateValue) => {
                                return (
                                    <React.Fragment>
                                        <IconButton color="primary" aria-label="Alterar empresa" onClick={() => {
                                            setAction("update");
                                            setOpen(true);
                                            setValue("companyId", tableMeta.rowData[0]);
                                            setValue("companyName", tableMeta.rowData[1], {
                                                shouldValidate: true
                                            });
                                            setValue("companyStatus", tableMeta.rowData[2] === "Ativa" ? "active" : "inactive", {
                                                shouldValidate: true
                                            })

                                        }}>
                                            <ManageAccountsIcon />
                                        </IconButton>
                                        <IconButton color="error" aria-label="Deletar empresa" onClick={() => {
                                            setAction("delete");
                                            setOpenDeleteDialog(true);
                                            setCompanyToDelete(tableMeta.rowData[0]);
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
                    {"Exclusão de empresa"}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Tem certeza que deseja deletar essa empresa?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDeleteDialog}>Não</Button>
                    {isDeleteLoading ? (
                        <CircularProgress size={26} className={classes.loginLoader} />
                    ) :
                        <Button color="secondary" onClick={handleDeleteCompany} autoFocus>
                            Sim
                        </Button>
                    }
                </DialogActions>
            </Dialog>

            <Dialog open={open} onClose={handleClose}>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <DialogTitle>Adicionar Empresa</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Insira aqui as informações da nova empresa:
                        </DialogContentText>

                        <Grid container>
                            <Grid item xs={12}>
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
                                    name={"companyName"}
                                    control={control}
                                    defaultValue=""
                                    render={({ field: { onChange, value }, fieldState: { error } }) => (
                                        <TextField
                                            autoFocus
                                            margin="normal"
                                            label="Nome da empresa"
                                            fullWidth
                                            variant="standard"
                                            error={!!error}
                                            helperText={error ? error.message : null}
                                            value={value}
                                            onChange={onChange}
                                        />
                                    )}
                                    rules={{
                                        required: "Insira o nome da empresa",
                                        minLength: {
                                            value: 4,
                                            message: "O nome deve ter no mínimo 4 caracteres"
                                        }
                                    }}
                                />
                            </Grid>
                        </Grid>

                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <Controller
                                    name={"companyStatus"}
                                    control={control}
                                    defaultValue=""
                                    render={({ field: { onChange, value }, fieldState: { error } }) => (
                                        <FormControl fullWidth>
                                            <InputLabel id="itemStatus">Situação da empresa</InputLabel>
                                            <Select
                                                labelId="companyStatus"
                                                id="companyStatus"
                                                value={value}
                                                label="Situação da empresa"
                                                onChange={onChange}
                                                error={!!error}
                                            >
                                                <MenuItem value={'active'}>Ativa</MenuItem>
                                                <MenuItem value={'inactive'}>Inativa</MenuItem>
                                            </Select>
                                        </FormControl>
                                    )}
                                    rules={{
                                        required: "Insira a situação da empresa"
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
                            <Button color="primary" type="submit">{action === "add" ? "Cadastrar empresa" : "Atualizar empresa"}</Button>
                        }
                    </DialogActions>
                </form>
            </Dialog>
        </>
    );
}

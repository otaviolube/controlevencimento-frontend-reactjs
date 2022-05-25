import React, { useEffect, useRef } from "react";

import {
    Grid,
    Button,
    TextField,
    CircularProgress,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Box,
} from "@material-ui/core";

import MUIDataTable from "mui-datatables";

import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import TrafficIcon from '@mui/icons-material/Traffic';

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

export default function Items(props) {

    const [items, setItems] = React.useState([]);
    const [open, setOpen] = React.useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(false);
    const [isDeleteLoading, setIsDeleteLoading] = React.useState(false);
    const [action, setAction] = React.useState("");
    const [itemToDelete, setItemToDelete] = React.useState("");

    const { handleSubmit, control, reset, setValue, watch } = useForm();

    const classes = useStyles();

    const userData = jwt_decode(localStorage.getItem("@compet-expiration-control"));
    console.log(userData);

    const itemYellowSign = useRef({});
    itemYellowSign.current = watch("itemYellowSign", "");

    const itemRedSign = useRef({});
    itemRedSign.current = watch("itemRedSign", "");

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
                const itemAddResponse = await api.post('/item', {
                    item_name: data.itemName,
                    item_description: data.itemDescription,
                    item_red_sign: data.itemRedSign,
                    item_yellow_sign: data.itemYellowSign,
                    item_green_sign: data.itemGreenSign,
                    item_status: data.itemStatus
                });

                console.log(itemAddResponse);

                if (itemAddResponse) {
                    sendNotification({
                        type: "message",
                        message: "Item criado com sucesso!",
                        variant: "contained",
                        color: "primary"
                    }, notification_options);
                    setTimeout(() => setOpen(false), 3000);
                } else {
                    sendNotification({
                        type: "defence",
                        message: "Erro ao criar item",
                        variant: "contained",
                        color: "secondary"
                    }, notification_options);
                }

            } else if (action === "update") {
                const itemUpdateResponse = await api.patch(`/item/${data.itemId}`, {
                    item_name: data.itemName,
                    item_description: data.itemDescription,
                    item_red_sign: data.itemRedSign,
                    item_yellow_sign: data.itemYellowSign,
                    item_green_sign: data.itemGreenSign,
                    item_status: data.itemStatus
                });

                console.log(itemUpdateResponse);

                if (itemUpdateResponse) {
                    sendNotification({
                        type: "message",
                        message: "Item atualizado com sucesso!",
                        variant: "contained",
                        color: "primary"
                    }, notification_options);
                    setTimeout(() => setOpen(false), 3000);
                } else {
                    sendNotification({
                        type: "defence",
                        message: "Erro ao atualizar item",
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
                    message: "Erro ao criar item",
                    variant: "contained",
                    color: "secondary"
                }, notification_options);
            } else if (action === "update") {
                sendNotification({
                    type: "defence",
                    message: "Erro ao atualizar item",
                    variant: "contained",
                    color: "secondary"
                }, notification_options);
            }
        }
    }

    const handleDeleteItem = async () => {

        setIsDeleteLoading(true);

        if (itemToDelete !== "") {
            try {
                const itemToDeleteResponse = await api.delete(`/item/${itemToDelete}`);
                if (itemToDeleteResponse) {
                    sendNotification({
                        type: "message",
                        message: "Item deletado com sucesso!",
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
                        message: "Erro ao deletar item!",
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
                    message: "Erro ao deletar item!",
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
                    const response = await api.get('/items');
                    console.log(response.data);
                    setItems(response.data.items.map(item => [
                        item.item_id,
                        item.item_name,
                        item.item_description,
                        `${item.item_red_sign} dias`,
                        `${item.item_yellow_sign} dias`,
                        item.item_status === "active" ? "Ativo" : "Inativo"
                    ]));
                } catch (error) {
                    setItems(null);
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

            <PageTitle title="Itens" button={<Button
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
                    title="Lista de Itens"
                    data={items}
                    columns={[{ name: "Id", options: { display: "excluded", filter: false, sort: false } }, "Nome", "Descrição", "Farol Vermelho", "Farol Amarelo", "Status", {
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
                                            setValue("itemId", tableMeta.rowData[0]);
                                            setValue("itemName", tableMeta.rowData[1], {
                                                shouldValidate: true
                                            });
                                            setValue("itemDescription", tableMeta.rowData[2], {
                                                shouldValidate: true
                                            });
                                            setValue("itemRedSign", tableMeta.rowData[3], {
                                                shouldValidate: true
                                            });
                                            setValue("itemYellowSign", tableMeta.rowData[4], {
                                                shouldValidate: true
                                            });
                                            setValue("itemStatus", tableMeta.rowData[5] === "Ativo" ? "active" : "inactive", {
                                                shouldValidate: true
                                            })

                                        }}>
                                            <ManageAccountsIcon />
                                        </IconButton>
                                        <IconButton color="error" aria-label="Deletar item" onClick={() => {
                                            setAction("delete");
                                            setOpenDeleteDialog(true);
                                            setItemToDelete(tableMeta.rowData[0]);
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
                    {"Exclusão de item"}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Tem certeza que deseja deletar esse item?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDeleteDialog}>Não</Button>
                    {isDeleteLoading ? (
                        <CircularProgress size={26} className={classes.loginLoader} />
                    ) :
                        <Button color="secondary" onClick={handleDeleteItem} autoFocus>
                            Sim
                        </Button>
                    }

                </DialogActions>
            </Dialog>

            <Dialog open={open} onClose={handleClose}>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <DialogTitle>Adicionar Item</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Insira aqui as informações do novo item:
                        </DialogContentText>

                        <Grid container>
                            <Grid item xs={12}>
                                <Controller
                                    name={"itemId"}
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
                                    name={"itemName"}
                                    control={control}
                                    defaultValue=""
                                    render={({ field: { onChange, value }, fieldState: { error } }) => (
                                        <TextField
                                            autoFocus
                                            margin="normal"
                                            label="Nome do item"
                                            fullWidth
                                            variant="standard"
                                            error={!!error}
                                            helperText={error ? error.message : null}
                                            value={value}
                                            onChange={onChange}
                                        />
                                    )}
                                    rules={{
                                        required: "Insira o nome do item",
                                        minLength: {
                                            value: 4,
                                            message: "O nome deve ter no mínimo 4 caracteres"
                                        }
                                    }}
                                />
                            </Grid>
                        </Grid>

                        <Grid container>
                            <Grid item xs={12}>
                                <Controller
                                    name={"itemDescription"}
                                    control={control}
                                    defaultValue=""
                                    render={({ field: { onChange, value }, fieldState: { error } }) => (
                                        <TextField
                                            margin="normal"
                                            label="Descrição do item"
                                            fullWidth
                                            variant="standard"
                                            error={!!error}
                                            helperText={error ? error.message : null}
                                            value={value}
                                            onChange={onChange}
                                        />
                                    )}
                                />
                            </Grid>
                        </Grid>

                        <Grid container>

                            <Grid item xs={6}>
                                <Controller
                                    name={"itemRedSign"}
                                    control={control}
                                    defaultValue=""
                                    render={({ field: { onChange, value }, fieldState: { error } }) => (
                                        <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
                                            <TrafficIcon sx={{ color: 'red', mr: 1.0, my: 4.0 }} />
                                            <TextField
                                                margin="normal"
                                                label="Farol vermelho"
                                                variant="standard"
                                                type="number"
                                                error={!!error}
                                                helperText={error ? error.message : null}
                                                value={value}
                                                onChange={onChange}
                                            />
                                        </Box>
                                    )}
                                    rules={{
                                        required: "Farol vermelho necessário",
                                        validate: value =>
                                            value < itemYellowSign.current || "Deve ser menor que o amarelo"
                                    }}
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <Controller
                                    name={"itemYellowSign"}
                                    control={control}
                                    defaultValue=""
                                    render={({ field: { onChange, value }, fieldState: { error } }) => (
                                        <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
                                            <TrafficIcon sx={{ color: 'yellow', mr: 1.0, my: 4.0 }} />
                                            <TextField
                                                margin="normal"
                                                label="Farol amarelo"
                                                variant="standard"
                                                type="number"
                                                error={!!error}
                                                helperText={error ? error.message : null}
                                                value={value}
                                                onChange={onChange}
                                            />
                                        </Box>
                                    )}
                                    rules={{
                                        required: "Farol amarelo necessário",
                                        validate: value =>
                                            value > itemRedSign.current || "Deve ser maior que o vermelho"
                                    }}
                                />
                            </Grid>
                        </Grid>

                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <Controller
                                    name={"itemStatus"}
                                    control={control}
                                    defaultValue=""
                                    render={({ field: { onChange, value }, fieldState: { error } }) => (
                                        <FormControl fullWidth>
                                            <InputLabel id="itemStatus">Situação do item</InputLabel>
                                            <Select
                                                labelId="itemStatus"
                                                id="itemStatus"
                                                value={value}
                                                label="Situação do item"
                                                onChange={onChange}
                                                error={!!error}
                                            >
                                                <MenuItem value={'active'}>Ativo</MenuItem>
                                                <MenuItem value={'inactive'}>Inativo</MenuItem>
                                            </Select>
                                        </FormControl>
                                    )}
                                    rules={{
                                        required: "Insira a situação do item"
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
                            <Button color="primary" type="submit">{action === "add" ? "Cadastrar item" : "Atualizar item"}</Button>
                        }
                    </DialogActions>
                </form>
            </Dialog>


        </>
    );
}

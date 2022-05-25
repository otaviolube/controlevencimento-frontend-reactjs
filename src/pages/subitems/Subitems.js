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
    Box
} from "@material-ui/core";

import { Autocomplete } from '@mui/material';

import MUIDataTable from "mui-datatables";

import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import TrafficIcon from '@mui/icons-material/Traffic';
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

export default function Subitems(props) {

    const [subitems, setSubitems] = React.useState([]);
    const [open, setOpen] = React.useState(false);
    const [openItems, setOpenItems] = React.useState(false);
    const [optionsItems, setOptionsItems] = React.useState([]);
    const [openDeleteDialog, setOpenDeleteDialog] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(false);
    const [isDeleteLoading, setIsDeleteLoading] = React.useState(false);
    const [action, setAction] = React.useState("");
    const [subitemToDelete, setSubitemToDelete] = React.useState("");

    const loadingItems = openItems && optionsItems.length === 0;

    const { handleSubmit, control, reset, setValue, watch } = useForm();

    const classes = useStyles();

    const subitemYellowSign = useRef({});
    subitemYellowSign.current = watch("itemYellowSign", "");

    const subitemRedSign = useRef({});
    subitemRedSign.current = watch("itemRedSign", "");

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
                const subitemAddResponse = await api.post('/subitem', {
                    subitem_name: data.subitemName,
                    subitem_description: data.subitemDescription,
                    subitem_red_sign: data.subitemRedSign > 0 ? data.subitemRedSign : null,
                    subitem_yellow_sign: data.subitemYellowSign > 0 ? data.subitemYellowSign : null,
                    subitem_green_sign: data.subitemGreenSign > 0 ? data.subitemGreenSign : null,
                    subitem_status: data.subitemStatus,
                    item_id: data.itemId
                });

                console.log(subitemAddResponse);

                if (subitemAddResponse) {
                    sendNotification({
                        type: "message",
                        message: "Subitem criado com sucesso!",
                        variant: "contained",
                        color: "primary"
                    }, notification_options);
                    setTimeout(() => setOpen(false), 3000);
                } else {
                    sendNotification({
                        type: "defence",
                        message: "Erro ao criar subitem",
                        variant: "contained",
                        color: "secondary"
                    }, notification_options);
                }

            } else if (action === "update") {
                const subitemUpdateResponse = await api.patch(`/subitem/${data.subitemId}`, {
                    subitem_name: data.subitemName,
                    subitem_description: data.subitemDescription,
                    subitem_red_sign: data.subitemRedSign,
                    subitem_yellow_sign: data.subitemYellowSign,
                    subitem_green_sign: data.subitemGreenSign,
                    subitem_status: data.subitemStatus,
                    item_id: data.itemId
                });

                console.log(subitemUpdateResponse);

                if (subitemUpdateResponse) {
                    sendNotification({
                        type: "message",
                        message: "Subitem atualizado com sucesso!",
                        variant: "contained",
                        color: "primary"
                    }, notification_options);
                    setTimeout(() => setOpen(false), 3000);
                } else {
                    sendNotification({
                        type: "defence",
                        message: "Erro ao atualizar subitem",
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
                    message: "Erro ao criar subitem",
                    variant: "contained",
                    color: "secondary"
                }, notification_options);
            } else if (action === "update") {
                sendNotification({
                    type: "defence",
                    message: "Erro ao atualizar subitem",
                    variant: "contained",
                    color: "secondary"
                }, notification_options);
            }
        }
    }

    const handleDeleteItem = async () => {

        setIsDeleteLoading(true);

        if (subitemToDelete !== "") {
            try {
                const subitemToDeleteResponse = await api.delete(`/subitem/${subitemToDelete}`);
                if (subitemToDeleteResponse) {
                    sendNotification({
                        type: "message",
                        message: "Subitem deletado com sucesso!",
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
                        message: "Erro ao deletar subitem!",
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
                    message: "Erro ao deletar subitem!",
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
                    const response = await api.get('/subitems');
                    console.log(response.data);
                    setSubitems(response.data.subitems.map(subitem => [
                        subitem.subitem_id,
                        subitem.item_id,
                        subitem.subitem_name,
                        subitem.subitem_description,
                        subitem.item.item_name,
                        subitem.subitem_red_sign,
                        subitem.subitem_yellow_sign,
                        subitem.subitem_status === "active" ? "Ativo" : "Inativo"
                    ]));
                } catch (error) {
                    setSubitems(null);
                    console.log(error);
                }
            })();
        }
    }, [open, openDeleteDialog]);

    useEffect(() => {
        let active = true;

        if (!loadingItems) {
            return undefined;
        }

        (async () => {
            let response = await api.get('/items');
            console.log(response.data.items);
            if (active) {
                setOptionsItems([...response.data.items]);
            }
        })();

        return () => {
            active = false;
        }

    }, [loadingItems])

    useEffect(() => {
        if (!openItems) {
            setOptionsItems([]);
        }
    }, [openItems])

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

            <PageTitle title="Subitens" button={<Button
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
                    title="Lista de Subitens"
                    data={subitems}
                    columns={[{ name: "subitemId", options: { display: "excluded", filter: false, sort: false } }, { name: "itemId", options: { display: "excluded", filter: false, sort: false } }, "Nome", "Descrição", "Item", "Farol Vermelho", "Farol Amarelo", "Status", {
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
                                        <IconButton color="primary" aria-label="Alterar subitem" onClick={() => {
                                            setAction("update");
                                            setOpen(true);
                                            setValue("subitemId", tableMeta.rowData[0]);
                                            setValue("itemId", tableMeta.rowData[1]);
                                            setValue("subitemName", tableMeta.rowData[2], {
                                                shouldValidate: true
                                            });
                                            setValue("subitemDescription", tableMeta.rowData[3], {
                                                shouldValidate: true
                                            });
                                            setValue("subitemItemName", tableMeta.rowData[4], {
                                                shouldValidate: true
                                            });
                                            setValue("subitemRedSign", tableMeta.rowData[5], {
                                                shouldValidate: true
                                            });
                                            setValue("subitemYellowSign", tableMeta.rowData[6], {
                                                shouldValidate: true
                                            });
                                            setValue("subitemStatus", tableMeta.rowData[7] === "Ativo" ? "active" : "inactive", {
                                                shouldValidate: true
                                            })

                                        }}>
                                            <ManageAccountsIcon />
                                        </IconButton>
                                        <IconButton color="error" aria-label="Deletar subitem" onClick={() => {
                                            setAction("delete");
                                            setOpenDeleteDialog(true);
                                            setSubitemToDelete(tableMeta.rowData[0]);
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
                    {"Exclusão de subitem"}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Tem certeza que deseja deletar esse subitem?
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
                    <DialogTitle>Adicionar Subitem</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Insira aqui as informações do novo subitem:
                        </DialogContentText>

                        <Grid container spacing={2}>
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
                                    name={"subitemId"}
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
                                    name={"subitemName"}
                                    control={control}
                                    defaultValue=""
                                    render={({ field: { onChange, value }, fieldState: { error } }) => (
                                        <TextField
                                            autoFocus
                                            margin="normal"
                                            label="Nome do subitem"
                                            fullWidth
                                            variant="standard"
                                            error={!!error}
                                            helperText={error ? error.message : null}
                                            value={value}
                                            onChange={onChange}
                                        />
                                    )}
                                    rules={{
                                        required: "Insira o nome do subitem",
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
                                    name={"subitemDescription"}
                                    control={control}
                                    defaultValue=""
                                    render={({ field: { onChange, value }, fieldState: { error } }) => (
                                        <TextField
                                            margin="normal"
                                            label="Descrição do subitem"
                                            fullWidth
                                            variant="standard"
                                            error={!!error}
                                            helperText={error ? error.message : null}
                                            value={value}
                                            onChange={onChange}
                                        />
                                    )}
                                    rules={{
                                        minLength: {
                                            value: 5,
                                            message: "A descrição deve ter no mínimo 5 caracteres"
                                        }
                                    }}
                                />
                            </Grid>
                        </Grid>

                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <Controller
                                    name={"subitemItemName"}
                                    control={control}
                                    render={({ field: { onChange, value } }) => (
                                        <Autocomplete
                                            id="items"
                                            open={openItems}
                                            onOpen={() => {
                                                setOpenItems(true);
                                            }}
                                            onClose={() => {
                                                setOpenItems(false);
                                            }}
                                            isOptionEqualToValue={(option, value) => option.item_name === value.item_name}
                                            getOptionLabel={(option) => {
                                                console.log(option)
                                                return option.item_name
                                            }}
                                            options={optionsItems}
                                            loading={loadingItems}
                                            // value={value}
                                            onChange={(_, value) => {
                                                setValue("itemId", value.item_id);
                                                onChange(value.item_name)
                                            }}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    label="Item"
                                                    InputProps={{
                                                        ...params.InputProps,
                                                        endAdornment: (
                                                            <React.Fragment>
                                                                {loadingItems ? <CircularProgress color="inherit" size={20} /> : null}
                                                                {params.InputProps.endAdornment}
                                                            </React.Fragment>
                                                        ),
                                                    }}
                                                />
                                            )}
                                        />
                                    )}
                                    rules={{
                                        required: "Insira a categoria do subitem",
                                    }}
                                />
                            </Grid>
                        </Grid>

                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <Controller
                                    name={"subitemRedSign"}
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
                                        validate: value =>
                                            (subitemYellowSign.current || subitemRedSign.current) ? value > subitemYellowSign.current || "Deve ser menor que o amarelo" : true
                                    }}
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <Controller
                                    name={"subitemYellowSign"}
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
                                        validate: value =>
                                            (subitemYellowSign.current || subitemRedSign.current) ? value > subitemRedSign.current || "Deve ser maior que o vermelho" : true
                                    }}
                                />
                            </Grid>
                        </Grid>

                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <Controller
                                    name={"subitemStatus"}
                                    control={control}
                                    defaultValue=""
                                    render={({ field: { onChange, value }, fieldState: { error } }) => (
                                        <FormControl fullWidth>
                                            <InputLabel id="itemStatus">Situação do subitem</InputLabel>
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
                                        required: "Insira a situação do subitem"
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
                            <Button color="primary" type="submit">{action === "add" ? "Cadastrar subitem" : "Atualizar subitem"}</Button>
                        }
                    </DialogActions>
                </form>
            </Dialog>
        </>
    );
}

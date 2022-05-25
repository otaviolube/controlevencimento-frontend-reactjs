import React from "react";
import { Grid } from "@material-ui/core";
import MUIDataTable from "mui-datatables";

// components
import PageTitle from "../../components/PageTitle";

const datatableData = [
    ["Joe James", "Example Inc.", "Yonkers", "NY"],
    ["John Walsh", "Example Inc.", "Hartford", "CT"],
    ["Bob Herm", "Example Inc.", "Tampa", "FL"],
    ["James Houston", "Example Inc.", "Dallas", "TX"],
    ["Prabhakar Linwood", "Example Inc.", "Hartford", "CT"],
    ["Kaui Ignace", "Example Inc.", "Yonkers", "NY"],
    ["Esperanza Susanne", "Example Inc.", "Hartford", "CT"],
    ["Christian Birgitte", "Example Inc.", "Tampa", "FL"],
    ["Meral Elias", "Example Inc.", "Hartford", "CT"],
    ["Deep Pau", "Example Inc.", "Yonkers", "NY"],
    ["Sebastiana Hani", "Example Inc.", "Dallas", "TX"],
    ["Marciano Oihana", "Example Inc.", "Yonkers", "NY"],
    ["Brigid Ankur", "Example Inc.", "Dallas", "TX"],
    ["Anna Siranush", "Example Inc.", "Yonkers", "NY"],
    ["Avram Sylva", "Example Inc.", "Hartford", "CT"],
    ["Serafima Babatunde", "Example Inc.", "Tampa", "FL"],
    ["Gaston Festus", "Example Inc.", "Tampa", "FL"],
];

export default function Contracts() {
    
    return (
        <>
            <PageTitle title="Contratos" />
            <Grid container spacing={4}>
                <Grid item xs={12}>
                    <MUIDataTable
                        title="Lista de Contratos"
                        data={datatableData}
                        columns={["Name", "Company", "City", "State"]}
                        options={{
                            filterType: "checkbox",
                        }}
                    />
                </Grid>
            </Grid>
        </>
    );
}

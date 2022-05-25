import React from "react";
import {
  Route,
  Switch,
  withRouter,
} from "react-router-dom";
import classnames from "classnames";
import {Box, IconButton, Link} from '@material-ui/core'
import Icon from '@mdi/react'

import {
  mdiFacebook as FacebookIcon,
  mdiLinkedin as LinkedinIcon
} from '@mdi/js'

import useStyles from "./styles";

import Header from "../Header";
import Sidebar from "../Sidebar";

import Dashboard from "../../pages/dashboard";
import Expirations from "../../pages/expirations";
import Companies from "../../pages/companies";
import Clients from "../../pages/clients";
import Colaborators from "../../pages/colaborators";
import Users from "../../pages/users";
import Contracts from "../../pages/contracts";
import Areas from "../../pages/areas";
import Items from "../../pages/items";
import Subitems from "../../pages/subitems";

import { useLayoutState } from "../../context/LayoutContext";

import VerifyToken from "../../components/VerifyToken";

function Layout(props) {
  
  const classes = useStyles();

  const layoutState = useLayoutState();
  
  return (
    <div className={classes.root}>
        <>

          <VerifyToken props={props} />
          
          <Header history={props.history} />
          <Sidebar />
          <div
            className={classnames(classes.content, {
              [classes.contentShift]: layoutState.isSidebarOpened,
            })}
          >
            <div className={classes.fakeToolbar} />
            <Switch>
              <Route path="/app/dashboard" component={Dashboard}/>
              <Route path="/app/expirations" component={Expirations} />
              <Route path="/app/companies" component={Companies} />
              <Route path="/app/clients" component={Clients} />
              <Route path="/app/colaborators" component={Colaborators} />
              <Route path="/app/users" component={Users} />
              <Route path="/app/contracts" component={Contracts} />
              <Route path="/app/areas" component={Areas} />
              <Route path="/app/items" component={Items} />
              <Route path="/app/subitems" component={Subitems} />
            </Switch>
            <Box
              mt={5}
              width={"100%"}
              display={"flex"}
              alignItems={"center"}
              justifyContent="space-between"
            >
              <div>
                <Link
                  color={'primary'}
                  href={'https://www.competengenharia.com.br/'}
                  target={'_blank'}
                  className={classes.link}
                >
                  Compet Engenharia
                </Link>
              </div>
              <div>
                <Link
                  href={'https://www.facebook.com/CompetEngenharia/'}
                  target={'_blank'}
                >
                  <IconButton aria-label="facebook">
                    <Icon
                      path={FacebookIcon}
                      size={1}
                      color="#6E6E6E99"
                    />
                  </IconButton>
                </Link>
                <Link
                  href={'https://www.linkedin.com/company/competengenharia/'}
                  target={'_blank'}
                >
                  <IconButton aria-label="linkedin">
                    <Icon
                      path={LinkedinIcon}
                      size={1}
                      color="#6E6E6E99"
                    />
                  </IconButton>
                </Link>
              </div>
            </Box>
          </div>
        </>
    </div>
  );
}

export default withRouter(Layout);

import React, { useState, useEffect } from "react";
import { Drawer, IconButton, List } from "@material-ui/core";
import {
  Home as HomeIcon,
  ArrowBack as ArrowBackIcon,
  HourglassEmptyTwoTone as HourglassEmptyTwoToneIcon,
  Business as BusinessIcon,

} from "@material-ui/icons";

import EngineeringIcon from '@mui/icons-material/Engineering';
import GroupIcon from '@mui/icons-material/Group';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import PushPinIcon from '@mui/icons-material/PushPin';
import CategoryIcon from '@mui/icons-material/Category';
import PeopleIcon from '@mui/icons-material/People';
import ExtensionIcon from '@mui/icons-material/Extension';

import { useTheme } from "@material-ui/styles";
import { withRouter } from "react-router-dom";
import classNames from "classnames";

// styles
import useStyles from "./styles";

// components
import SidebarLink from "./components/SidebarLink/SidebarLink";

// context
import {
  useLayoutState,
  useLayoutDispatch,
  toggleSidebar,
} from "../../context/LayoutContext";

const structure = [
  { 
    id: 0, 
    label: "Dashboard", 
    link: "/app/dashboard", 
    icon: <HomeIcon /> 
  },
  {
    id: 1,
    label: "Vencimentos",
    link: "/app/expirations",
    icon: <HourglassEmptyTwoToneIcon />
  },
  { 
    id: 2, 
    label: "Empresas", 
    link: "/app/companies", 
    icon: <BusinessIcon /> 
  },
  { 
    id: 3, 
    label: "Clientes", 
    link: "/app/clients", 
    icon: <PeopleIcon /> 
  },
  {
    id: 4,
    label: "Colaboradores",
    link: "/app/colaborators",
    icon: <EngineeringIcon />,
  },
  {
    id: 5,
    label: "Usuários",
    link: "/app/users",
    icon: <GroupIcon />,
  },
  {
    id: 6,
    label: "Contratos",
    link: "/app/contracts",
    icon: <ReceiptLongIcon />,
  },
  {
    id: 7,
    label: "Áreas",
    link: "/app/areas",
    icon: <PushPinIcon />,
  },
  {
    id: 8,
    label: "Itens",
    link: "/app/items",
    icon: <CategoryIcon />,
  },
  {
    id: 9,
    label: "Subitens",
    link: "/app/subitems",
    icon: <ExtensionIcon />,
  }
];

function Sidebar({ location }) {
  var classes = useStyles();
  var theme = useTheme();

  // global
  var { isSidebarOpened } = useLayoutState();
  var layoutDispatch = useLayoutDispatch();

  // local
  var [isPermanent, setPermanent] = useState(true);

  useEffect(function () {
    window.addEventListener("resize", handleWindowWidthChange);
    handleWindowWidthChange();
    return function cleanup() {
      window.removeEventListener("resize", handleWindowWidthChange);
    };
  });

  return (
    <Drawer
      variant={isPermanent ? "permanent" : "temporary"}
      className={classNames(classes.drawer, {
        [classes.drawerOpen]: isSidebarOpened,
        [classes.drawerClose]: !isSidebarOpened,
      })}
      classes={{
        paper: classNames({
          [classes.drawerOpen]: isSidebarOpened,
          [classes.drawerClose]: !isSidebarOpened,
        }),
      }}
      open={isSidebarOpened}
    >
      <div className={classes.toolbar} />
      <div className={classes.mobileBackButton}>
        <IconButton onClick={() => toggleSidebar(layoutDispatch)}>
          <ArrowBackIcon
            classes={{
              root: classNames(classes.headerIcon, classes.headerIconCollapse),
            }}
          />
        </IconButton>
      </div>
      <List className={classes.sidebarList}>
        {structure.map(link => (
          <SidebarLink
            key={link.id}
            location={location}
            isSidebarOpened={isSidebarOpened}
            {...link}
          />
        ))}
      </List>
    </Drawer>
  );

  // ##################################################################
  function handleWindowWidthChange() {
    var windowWidth = window.innerWidth;
    var breakpointWidth = theme.breakpoints.values.md;
    var isSmallScreen = windowWidth < breakpointWidth;

    if (isSmallScreen && isPermanent) {
      setPermanent(false);
    } else if (!isSmallScreen && !isPermanent) {
      setPermanent(true);
    }
  }
}

export default withRouter(Sidebar);

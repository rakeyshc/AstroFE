import React from "react";
import "./App.css";

import { createTheme, ThemeProvider } from "@mui/material/styles";
import TopAppBar from "./components/menus/TopAppBar";
import LeftSideMenu from "./components/menus/LeftSideMenu";
import Box from "@mui/material/Box";

import Grid from "@mui/material/Grid";
import { AppMenuItem, DatabaseVersion, DialogSettings } from "./components/common/Models";

import ParameterTypeViewer from "./components/parameter-type/ParameterTypeViewer";

import TmTextCurveViewer from "./components/tm-text-curve/TmTextCurveViewer";
import TmPointCurveViewer from "./components/tm-point-curve/TmPointCurveViewer";
import TmParameterViewer from "./components/tm-parameter/TmParameterViewer";
import SubsystemViewer from "./components/subsystem/SubsystemViewer";
import TcRangeViewer from "./components/tc-range/TcRangeViewer";
import TcPointCurveViewer from "./components/tc-point-curve/TcPointCurveViewer";
import TcTextCurvesViewer from "./components/tc-text-curve/TcTextCurveViewer";
import TcParameterViewer from "./components/tc-parameter/TcParameterViewer";
import DeviceKindViewer from "./components/device-kind/DeviceKindViewer";
import LoginPage from "./components/login/LoginPage";
import InformationDialog from "./components/common/InformationDialog";
import { services } from "../service.config.ts";
import CommandViewer from "./components/commands/CommandViewer.tsx";
import FixedPacketViewer from "./components/fixed-packets/FixedPacketViewer.tsx";

// Lite Theme
const defaultTheme = createTheme({
  palette: {
    primary: {
      main: "#1976D2",
    },
  },
});

// Dark Theme
const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
});

export default function App() {
  // State - Global
  const [darkMode, setDarkMode] = React.useState(false); // Dark or lite mode

  const [selectedDatabaseVersion, setSelectedDatabaseVersion] = React.useState<DatabaseVersion>(DatabaseVersion.NONE); // The current selected DatabaseVersion
  const [selectedAppMenuItem, setSelectedAppMenuItem] = React.useState<AppMenuItem>(AppMenuItem.UNKNOWN); // The current selected AppMenuItem
  const [infoDialog, setInfoDialog] = React.useState<DialogSettings>(DialogSettings.NO_DIALOG); // Error dialog and it is data
  const [userInformation, setUserInformation] = React.useState<any>({}); // Error dialog and it is data
  const [selectedServiceNumber, setSelectedServiceNumber] = React.useState<number | null>(null);

  const handleInfoDialogClose = () => {
    setInfoDialog(DialogSettings.NO_DIALOG);
  };

  // Handlers - Global
  const handleThemeChange = (darkMode: boolean) => setDarkMode(darkMode);

  const handleDatabaseVersionChange = (databaseVersion: DatabaseVersion) => {
    setSelectedDatabaseVersion(databaseVersion);

    if (databaseVersion === DatabaseVersion.NONE) {
      setSelectedAppMenuItem(AppMenuItem.NONE);
    }
  };

  const showMenus = selectedAppMenuItem != AppMenuItem.LOGIN && selectedAppMenuItem != AppMenuItem.UNKNOWN;

  // *************************************************************************
  // ************************ Use Effect Hook & Fetch ************************
  // *************************************************************************

  const mounted: any = React.useRef();
  React.useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;

      // do componentDidMount logic
      fetchData(true);

      setInterval(() => fetchData(false), 100000);
    } else {
      // do componentDidUpdate logic
      // fetchData(true, false);
    }
  });

  const fetchData = (initial: boolean) => {
    fetch(import.meta.env.VITE_API_BASE_URL + "/login/user-info", {
      credentials: "include",
      method: "GET",
    })
      .then((response) => response.json())
      .then((actionResult) => {
        if (actionResult.success) {
          if (actionResult.result.loggedIn) {
            if (initial) {
              setSelectedAppMenuItem(AppMenuItem.NONE);
            }
          } else {
            setSelectedAppMenuItem(AppMenuItem.LOGIN);
          }

          setUserInformation(actionResult.result);
        } else {
          throw new Error(actionResult.message);
        }
      })
      .catch((error) => {
        setInfoDialog(new DialogSettings("API Error", "Unable to read data (" + error.message + ")"));
      })
      .finally(() => { });
  };

  return (
    <React.Fragment>
      <ThemeProvider theme={darkMode ? darkTheme : defaultTheme}>
        {/* Information Dialog */}
        {infoDialog.open && <InformationDialog dialogSettings={infoDialog} onClose={handleInfoDialogClose} />}

        <Box
          id="app-root-box"
          minWidth="100vw"
          width="100vw"
          minHeight="100vh"
          sx={{ backgroundColor: (theme) => (darkMode ? theme.palette.grey[900] : theme.palette.grey[100]) }}
        >
          {/* Top App Bar */}
          {showMenus && <TopAppBar onThemeChange={handleThemeChange} selectedDatabaseVersion={selectedDatabaseVersion} userInfo={userInformation} />}

          <Box id="app-box" display="flex">
            {showMenus && (
              <Box id="left-side-box" width={301} marginTop={11} marginLeft={1} marginRight={1}>
                {/* Left Side Menu */}
                <LeftSideMenu
                  selectedDatabaseVersion={selectedDatabaseVersion}
                  selectedAppMenuItem={selectedAppMenuItem}
                  onDatabaseVersionChange={handleDatabaseVersionChange}
                  onAppMenuChange={setSelectedAppMenuItem}
                  onServiceNumberChange={setSelectedServiceNumber}
                />
              </Box>
            )}

            {/* Data Container */}

            <Box id="main-box" component="main" width="100vw" sx={{ mt: 11, ml: 5, mr: 5 }}>
              {/* Data */}

              <Grid id="grid-item" item>
                {/* Login form */}
                {selectedAppMenuItem === AppMenuItem.LOGIN && <LoginPage />}

                {/* General */}

                {selectedAppMenuItem === AppMenuItem.PARAMETER_TYPE && <ParameterTypeViewer selectedDatabaseVersion={selectedDatabaseVersion} />}
                {selectedAppMenuItem === AppMenuItem.DEVICE_KIND && <DeviceKindViewer selectedDatabaseVersion={selectedDatabaseVersion} />}
                {selectedAppMenuItem === AppMenuItem.SUBSYSTEM && <SubsystemViewer selectedDatabaseVersion={selectedDatabaseVersion} />}

                {/* Telemetry */}

                {selectedAppMenuItem === AppMenuItem.TM_TEXT_CURVE && <TmTextCurveViewer selectedDatabaseVersion={selectedDatabaseVersion} />}
                {selectedAppMenuItem === AppMenuItem.TM_POINT_CURVE && <TmPointCurveViewer selectedDatabaseVersion={selectedDatabaseVersion} />}
                {selectedAppMenuItem === AppMenuItem.TM_PARAMETER && <TmParameterViewer selectedDatabaseVersion={selectedDatabaseVersion} />}

                {/* Telecommand */}

                {selectedAppMenuItem === AppMenuItem.TC_RANGE && <TcRangeViewer selectedDatabaseVersion={selectedDatabaseVersion} />}
                {selectedAppMenuItem === AppMenuItem.TC_TEXT_CURVE && <TcTextCurvesViewer selectedDatabaseVersion={selectedDatabaseVersion} />}
                {selectedAppMenuItem === AppMenuItem.TC_POINT_CURVE && <TcPointCurveViewer selectedDatabaseVersion={selectedDatabaseVersion} />}
                {selectedAppMenuItem === AppMenuItem.TC_PARAMETER && <TcParameterViewer selectedDatabaseVersion={selectedDatabaseVersion} />}

                {/* Commands and Fixed packets for available services */}
            
                
                {
                  services
                    .filter((service) => selectedAppMenuItem === AppMenuItem.COMMAND && service.serviceNumber === selectedServiceNumber)
                    .map((service) =>
                      <React.Fragment key={service.serviceNumber}>
                        <CommandViewer selectedDatabaseVersion={selectedDatabaseVersion} serviceNumber={service.serviceNumber} commandConfig={service.commands} />
                      </React.Fragment>
                    )

                }

                {
                  services
                    .filter((service) => selectedAppMenuItem === AppMenuItem.FIXED_PACKETS && service.serviceNumber === selectedServiceNumber)
                    .map((service) => (
                      <React.Fragment key={service.serviceNumber}>
                        <FixedPacketViewer selectedDatabaseVersion={selectedDatabaseVersion} serviceNumber={service.serviceNumber} fixedPacketsConfig={service.fixedpackets} />
                      </React.Fragment>
                    ))}
              </Grid>
            </Box>
          </Box>
        </Box>
      </ThemeProvider>
    </React.Fragment>
  );
}

import React, { useState, useEffect, useRef, createRef } from 'react'
import { useParams } from "react-router-dom";
import AnsiToHtml from 'ansi-to-html';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Button from '@mui/material/Button';
import Drawer from '@mui/material/Drawer';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { TextField } from '@mui/material';
import Collapse from '@mui/material/Collapse';
import Fade from '@mui/material/Fade';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Checkbox from '@mui/material/Checkbox';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import DeleteIcon from '@mui/icons-material/Delete';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

const convert = new AnsiToHtml({ newline: true });

function History() {
    const { routeId } = useParams();
    const [commands, setCommands] = useState([]);
    const [clickedCommand, setClickedCommand] = useState('');
    const [clickedDate, setClickedDate] = useState('');
    const [output, setOutput] = useState('');
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [drawerWidth, setDrawerWidth] = useState('60vw'); // Default width
    const [searchTerm, setSearchTerm] = useState('');
    const [open, setOpen] = useState([]);
    const [fade, setFade] = useState([]);
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [focusedCommandId, setFocusedCommandId] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [selectedItems, setSelectedItems] = useState([]);
    const [showDeleteCancelButtons, setShowDeleteCancelButtons] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [commandToDelete, setCommandToDelete] = useState(null);

    const [anchorEl, setAnchorEl] = useState(null);

    const listItemRefs = useRef([]);

    const handleOpenDialog = () => {
        setOpenDialog(true);
    };
    const toggleDrawerWidth = () => {
        setDrawerWidth(drawerWidth === '60vw' ? '90vw' : '60vw');
    };

    const searchInputRef = useRef(null);

    useEffect(() => {
        searchInputRef.current.focus();
    }, []);

    useEffect(() => {
        setOpen(commands.map(() => false));
        setFade(commands.map(() => false));
        listItemRefs.current = commands.map(() => createRef());
    }, [commands]);

    const handleContextClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleMenuItemClick = (database) => {
        // Navigate to the new route
        window.location.href = `/${database}`;
        handleClose();
    };

    const [databases, setDatabases] = useState([]);

    useEffect(() => {
        fetch(`http://localhost:3003/dbs`)
            .then(response => response.json())
            .then(data => {
                setDatabases(data);
            });
    }, []);

    useEffect(() => {
        const handleGlobalKeyDown = (event) => {
            if (event.key === 'Escape') {
                searchInputRef.current.focus();
            } else if (document.activeElement.tagName === 'LI' && listItemRefs.current.length > 0) {
                const currentIndex = listItemRefs.current.findIndex(ref => ref.current === document.activeElement);
                if ((event.key === 'j' || event.key === 'ArrowDown') && currentIndex < listItemRefs.current.length - 1) {
                    listItemRefs.current[currentIndex + 1].current.focus();
                    event.stopPropagation();
                } else if ((event.key === 'k' || event.key === 'ArrowUp') && currentIndex > 0) {
                    listItemRefs.current[currentIndex - 1].current.focus();
                    event.stopPropagation();
                }
            }

        };

        window.addEventListener('keydown', handleGlobalKeyDown);
        return () => window.removeEventListener('keydown', handleGlobalKeyDown);
    }, [listItemRefs, searchInputRef]);

    useEffect(() => {
        const timeouts = commands.map((_, index) =>
            setTimeout(() => {
                setOpen(prevOpen => {
                    const newOpen = [...prevOpen];
                    newOpen[index] = true;
                    return newOpen;
                });
            }, index * 80)
        );

        return () => timeouts.forEach(clearTimeout); // Clean up on unmount
    }, [commands]);

    useEffect(() => {
        const timeouts = commands.map((_, index) =>
            setTimeout(() => {
                setFade(prevFade => {
                    const newFade = [...prevFade];
                    newFade[index] = true;
                    return newFade;
                });
            }, index * 90)
        );

        return () => timeouts.forEach(clearTimeout); // Clean up on unmount
    }, [commands]);

    useEffect(() => {
        listItemRefs.current = commands.map(() => createRef());
    }, [commands]);


    useEffect(() => {
        const ws = new WebSocket(`ws://localhost:8675/data/${routeId}`);

        ws.onopen = () => {
            ws.send(routeId); // Send the routeId to the server when the connection is established
        };

        ws.onmessage = (event) => {
            const newData = JSON.parse(event.data);
            setCommands(newData);

        };

        return () => {
            ws.close();
        };
    }, [routeId]); // Re-run the effect when routeId changes

    useEffect(() => {
        fetch(`http://localhost:3003/data/${routeId}`)
            .then(response => response.json())
            .then(data => {
                setCommands(data);
                setFade(data.map(() => false)); // Initialize fade state here
            });
    }, []);

    const handleClick = (commandId) => {
        fetch(`http://localhost:3003/data/${routeId}/${commandId}`)
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    setOutput(data.error);
                } else {
                    setOutput(convert.toHtml(data.output));
                }
                setClickedCommand(data.command);
                setClickedDate(data.timestamp);
            });
    };


    const handleCloseSnackbar = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setOpenSnackbar(false);
    };

    const handleListItemClick = (id) => {
        handleClick(id);
        setDrawerOpen(true);
    };

    const toggleDrawer = (open) => (event) => {
        if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
            return;
        }
        setDrawerOpen(open);
    };

    function formatBytes(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';

        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }

    const copyToClipboard = async () => {
        try {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = output;
            tempDiv.querySelectorAll('br').forEach(br => br.replaceWith('\n'));
            tempDiv.querySelectorAll('div, p').forEach(block => block.append('\n'));
            const textToCopy = tempDiv.textContent || tempDiv.innerText || '';

            await navigator.clipboard.writeText(textToCopy);
        } catch (err) {
            console.error('Failed to copy: ', err);
        }
    };

    const performDelete = () => {
        if (Array.isArray(commandToDelete)) {
            Promise.all(commandToDelete.map(id => deleteCommand(id)))
                .then(() => {
                    setCommands(commands.filter(command => !commandToDelete.includes(command.id)));
                    setSelectedItems([]);
                    setEditMode(false);
                    setShowDeleteCancelButtons(false);
                    setSnackbarMessage('Command deleted successfully!');
                    setOpenSnackbar(true);
                })
                .catch(error => {
                    console.error('Failed to delete some items:', error);
                });
        } else {
            deleteCommand(commandToDelete)
                .then(() => {
                    setCommands(commands.filter(command => command.id !== commandToDelete));
                    setDrawerOpen(false);
                });
        }
        setCommandToDelete(null);
        setOpenDialog(false);
    };

    const deleteCommand = (commandId) => {
        return fetch(`http://localhost:3003/data/${routeId}/${commandId}`, {
            method: 'DELETE',
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
            })
            .catch(error => {
                setSnackbarMessage(`Error: ${error.message}`);
                setOpenSnackbar(true);
                throw error;
            });
    };

    const handleDeleteSelected = () => {
        setCommandToDelete(selectedItems);
        handleOpenDialog();
    };

    const handleCheckboxChange = (event, id) => {
        if (event.target.checked) {
            setSelectedItems([...selectedItems, id]);
        } else {
            setSelectedItems(selectedItems.filter(itemId => itemId !== id));
        }
    };

    const handleCancel = () => {
        setSelectedItems([]);
        setEditMode(false);
        setShowDeleteCancelButtons(false);
    };
    useEffect(() => {
        setShowDeleteCancelButtons(selectedItems.length > 0);
    }, [selectedItems]);

    return (
        <Box
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="left"
            marginTop="5vh"
            marginLeft="2vw"
            marginRight="2vw"
        >
            <Typography
                variant="h5"
                component="h1"
                gutterBottom
                onClick={handleContextClick}
                style={{
                    cursor: 'pointer',
                    color: '#007BFF',
                    textDecoration: 'none',
                    fontWeight: 'bold',
                    borderBottom: '4px solid #007BFF',
                    marginBottom: '16px',
                }}
            >
                {routeId}
            </Typography>
            <Menu
                id="simple-menu"
                anchorEl={anchorEl}
                keepMounted
                open={Boolean(anchorEl)}
                onClose={handleClose}
            >
                {databases.map((database) => (
                    <MenuItem onClick={() => handleMenuItemClick(database)} key={database}>
                        {database}
                    </MenuItem>
                ))}
            </Menu>
            <Box
                display="flex"
                justifyContent="left"
                alignItems="flex-end"
            >
                <TextField
                    id="search-box"
                    label="Filter"
                    variant="outlined"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Escape') {
                            setSearchTerm('');
                        }
                    }}
                    inputRef={searchInputRef}
                />
                <Button onClick={() => setEditMode(!editMode)}>
                    Edit
                </Button>
                {showDeleteCancelButtons && (
                    <>
                        <Button onClick={handleCancel}>
                            Cancel
                        </Button>
                        <Button onClick={handleDeleteSelected}>
                            Delete
                        </Button>
                    </>
                )}
            </Box>
            <Box style={{ display: 'flex' }}>

                <List style={{ width: '100%', marginTop: '8px' }}>
                    {commands
                        .filter((command) => {
                            return command.command.toLowerCase().includes(searchTerm.toLowerCase());
                        })
                        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                        .map((command, index) => (
                            <Collapse in={open[index]} timeout="auto" unmountOnExit key={command.id + command.timestamp}>
                                <Fade in={fade[index]} timeout={500}>
                                    <div
                                        onClick={() => {
                                            if (!editMode) {
                                                handleListItemClick(command.id);
                                            }
                                        }}
                                    >
                                        <ListItem
                                            onFocus={() => setFocusedCommandId(command.id)}
                                            ref={listItemRefs.current[index]}
                                            tabIndex={0}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && !editMode) {
                                                    handleListItemClick(command.id);
                                                }
                                                if (editMode && (e.key === ' ' || e.key === 'Enter')) {
                                                    handleCheckboxChange({ target: { checked: !selectedItems.includes(command.id) } }, command.id);
                                                    e.preventDefault(); // prevent the default action of scrolling the page
                                                }
                                            }}

                                            sx={{
                                                mb: 1,
                                                borderRadius: '4px',
                                                border: '1px solid',
                                                borderColor: '#C5B4E3',
                                                textDecoration: 'none',
                                                textAlign: 'left'
                                            }}
                                        >
                                            {editMode && (
                                                <Checkbox
                                                    checked={selectedItems.includes(command.id)}
                                                    onChange={(e) => handleCheckboxChange(e, command.id)}
                                                />
                                            )}
                                            <ListItemText
                                                primary={
                                                    <React.Fragment>
                                                        <Typography
                                                            component="span"
                                                            variant="body2"
                                                            color="textPrimary"
                                                            style={{ marginRight: '16px', fontWeight: 'bold' }}
                                                        >
                                                            {command.id}
                                                        </Typography>
                                                        <Typography
                                                            component="span"
                                                            variant="body2"
                                                            color="textSecondary"
                                                            style={{ marginRight: '16px' }}
                                                        >
                                                            {command.timestamp}
                                                        </Typography>

                                                        <Typography
                                                            component="span"
                                                            variant="body2"
                                                            color="textPrimary"
                                                            style={{ fontWeight: 'bold' }}
                                                        >
                                                            {command.command}
                                                        </Typography>
                                                        <Typography
                                                            component="span"
                                                            variant="body2"
                                                            color="textSecondary"
                                                            style={{ marginLeft: '6px' }}
                                                        >
                                                            ({formatBytes(command.output_size)})
                                                        </Typography>
                                                    </React.Fragment>
                                                }
                                            />
                                        </ListItem>
                                    </div>
                                </Fade>
                            </Collapse>

                        ))}
                </List>

                <Drawer
                    anchor="right"
                    open={drawerOpen}
                    onClose={toggleDrawer(false)}
                >
                    <Box
                        sx={{ width: drawerWidth, padding: '16px' }}
                        role="presentation"
                        onKeyDown={toggleDrawer(false)}
                    >
                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '16px',
                                backgroundColor: 'f5f5f5',
                                padding: '10px'
                            }}
                        >
                            <Button onClick={toggleDrawerWidth}>
                                {drawerWidth === '60vw' ? 'Expand' : 'Shrink'}
                            </Button>
                            <Typography variant="h6">Output</Typography>

                            <Button
                                onClick={() => {
                                    setCommandToDelete(focusedCommandId);
                                    handleOpenDialog();
                                }}
                                startIcon={<DeleteIcon />}
                            >
                                Delete
                            </Button>
                        </Box>
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                alignItems: 'left',
                                marginBottom: '8px',
                                backgroundColor: 'f5f5f5',
                            }}
                        >

                            <Typography
                                variant="h6"
                                style={{
                                    fontFamily: 'monospace',
                                    textAlign: 'left',
                                    width: '100%'
                                }}
                            > {clickedCommand}</Typography>
                            <Box
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    paddingRight: '10px',
                                    width: '100%'
                                }}>
                                <Typography
                                    variant="h9"
                                    style={{
                                        fontFamily: 'monospace',
                                        textAlign: 'left',
                                        width: '100%'
                                    }}

                                > {clickedDate}</Typography>
                                <Button onClick={copyToClipboard} startIcon={<ContentCopyIcon />}>
                                    Copy
                                </Button>
                            </Box>
                        </Box>
                        <Typography
                            variant="body1"
                            component="pre"
                            style={{
                                fontFamily: 'monospace',
                                textAlign: 'left',
                                overflowX: 'auto',
                                padding: '18px',
                                backgroundColor: '#1e1e1e',
                                color: 'white',
                            }}
                        >
                            <code dangerouslySetInnerHTML={{ __html: output }}></code>
                        </Typography>
                    </Box>
                </Drawer >
            </Box >

            <Dialog
                open={openDialog}
                onClose={() => setOpenDialog(false)}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">{"Confirm Deletion"}</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Are you sure?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={performDelete} color="primary" autoFocus>
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
            <Snackbar open={openSnackbar} autoHideDuration={1000} onClose={handleCloseSnackbar}>
                <Alert onClose={handleCloseSnackbar} severity={snackbarMessage.startsWith('Error') ? 'error' : 'success'} sx={{ width: '100%' }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>


        </Box>
    )
}

export default History
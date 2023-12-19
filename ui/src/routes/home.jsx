import React, { useState, useEffect, useRef, createRef } from 'react'
import * as ReactDOM from "react-dom/client";
import {
    createBrowserRouter,
    RouterProvider,
    useParams
} from "react-router-dom";
import AnsiToHtml from 'ansi-to-html';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import { TextField } from '@mui/material';

function Home() {
    const [databases, setDatabases] = useState([]);
    const [filterText, setFilterText] = useState("");

    useEffect(() => {
        fetch(`http://localhost:3003/dbs`)
            .then(response => response.json())
            .then(data => {
                setDatabases(data);
            });
    }, []);

    const searchInputRef = useRef(null);
    const listItemRefs = useRef([]);
    useEffect(() => {
        listItemRefs.current = databases.map(() => createRef());
    }, [databases]);
    useEffect(() => {
        searchInputRef.current.focus();
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

    return (
        <Box
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            marginTop="5vh" // margin top for spacing from the top of the viewport
        >
            <Typography variant="h4" component="h1" gutterBottom>
                k8s history
            </Typography>
            <Box sx={{ width: '30%' }}> {/* Add this Box */}

                <TextField
                    variant="outlined"
                    placeholder="k8s context"
                    value={filterText}
                    onChange={e => setFilterText(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Escape') {
                            setFilterText('');
                        } else if (e.key === 'Tab' && listItemRefs.current.length > 0) {
                            e.preventDefault(); // Prevent the default tab behavior
                            listItemRefs.current[0].current.focus(); // Focus on the first ListItem
                        }
                    }}
                    inputRef={searchInputRef}
                    fullWidth
                />
                <List sx={{ bgcolor: 'background.paper' }}>
                    {databases.filter(db => db.toLowerCase().includes(filterText.toLowerCase())).map((db, index) => (

                        <ListItem
                            key={db}
                            component="a"
                            href={`/${db}`}
                            ref={listItemRefs.current[index]}
                            tabIndex={0}
                            sx={{
                                mb: 1,
                                borderRadius: '4px',
                                border: '1px solid',
                                borderColor: 'divider',
                                '&:hover': {
                                    bgcolor: 'primary.light',
                                    color: 'white',
                                },
                                textDecoration: 'none',
                                textAlign: 'center'
                            }}

                        >
                            <ListItemText primary={db} sx={{ textAlign: 'center' }} />
                        </ListItem>

                    ))}
                </List>
            </Box>

        </Box>
    );

}

export default Home
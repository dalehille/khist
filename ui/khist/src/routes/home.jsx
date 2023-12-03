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
import Button from '@mui/material/Button';
import Drawer from '@mui/material/Drawer';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { TextField } from '@mui/material';

function Home() {
    const [databases, setDatabases] = useState([]);

    useEffect(() => {
        fetch(`http://localhost:3003/dbs`)
            .then(response => response.json())
            .then(data => {
                setDatabases(data);
            });
    }, []);

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
            <List sx={{ width: '30%', bgcolor: 'background.paper' }}>
                {databases.map((db, index) => (
                    <ListItem
                        key={db}
                        component="a"
                        href={`/${db}`}
                        sx={{
                            mb: 1, // margin bottom for spacing between items
                            borderRadius: '4px', // rounded corners
                            border: '1px solid', // outline for the list items
                            borderColor: 'divider', // use the theme's divider color for the border
                            '&:hover': {
                                bgcolor: 'primary.light', // background color on hover
                                color: 'white', // text color on hover
                            },
                            textDecoration: 'none', // remove underline from links
                            textAlign: 'center' // center the text
                        }}

                    >
                        <ListItemText primary={db} sx={{ textAlign: 'center' }} />
                    </ListItem>

                ))}
            </List>

        </Box>
    );

}

export default Home
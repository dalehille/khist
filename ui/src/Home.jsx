import { useState, useEffect, useRef, createRef } from 'react'
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import { TextField } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Link } from 'react-router-dom';


function Home() {
    const [databases, setDatabases] = useState([]);
    const [filterText, setFilterText] = useState("");

    const theme = useTheme();


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
            marginTop="5vh"
        >
            <Typography component="h4" gutterBottom>
                Choose a cluster
            </Typography>
            <Box sx={{ width: { xs: '90%', sm: '65%' } }}>

                <TextField
                    id="cluster-filter"
                    variant="outlined"
                    placeholder="search..."
                    size="small"
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
                <List>
                    {databases.filter(db => db.toLowerCase().includes(filterText.toLowerCase())).map((db, index) => (

                        <ListItem
                            key={db}
                            component={Link}
                            to={`/${db}`}
                            ref={listItemRefs.current[index]}
                            tabIndex={0}
                            style={style.listItem}
                            sx={{
                                color: 'text.primary',
                                borderRadius: '4px',
                                border: '1px solid',
                                borderColor: 'divider',
                                '&:hover': {
                                    bgcolor: theme.palette.custom.listItem.hoverBackground,
                                    color: theme.palette.custom.listItem.hoverText,
                                },
                                mb: 1,
                            }}
                        >
                            <ListItemText primary={db} style={style.listItemText} />
                        </ListItem>

                    ))}
                </List>
            </Box>

        </Box >
    );

}

const style = {
    listItem: {
        width: '100%',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    },
    listItemText: {
        width: '100%',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        textAlign: 'center',
    },
}

export default Home
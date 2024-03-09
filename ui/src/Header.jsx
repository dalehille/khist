import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import { useNavigate } from 'react-router-dom'

function Header({ setMode }) {
    const appName = "khist"

    const navigate = useNavigate()

    const handleHomeClick = () => {
        navigate('/');
    }

    const handleThemeToggle = () => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
    };

    return (
        <AppBar position="static">
            <Container maxWidth="false">
                <Toolbar disableGutters>
                    <Button
                        key="Home"
                        onClick={handleHomeClick}
                        sx={{ my: 2, color: 'white', display: 'block' }}
                    >
                        <Typography
                            variant="h6"
                            noWrap
                            sx={{
                                display: 'flex',
                                fontFamily: 'monospace',
                                fontWeight: 700,
                                letterSpacing: '.3rem',
                                color: 'inherit',
                                textDecoration: 'none',
                            }}
                        >
                            {appName}
                        </Typography>
                    </Button>

                    <Box sx={{ flexGrow: 1 }} />
                    <IconButton
                        edge="end"
                        aria-label="change theme"
                        onClick={handleThemeToggle}
                        sx={{ mr: 1 }}
                    >
                        <Brightness4Icon />
                    </IconButton>
                </Toolbar>
            </Container>
        </AppBar>
    );
}
export default Header;
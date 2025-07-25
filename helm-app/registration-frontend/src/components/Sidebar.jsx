'use client';
import { Drawer, List, ListItem, ListItemIcon, ListItemText, Toolbar } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import DescriptionIcon from '@mui/icons-material/Description';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import PaymentsIcon from '@mui/icons-material/Payments';
import GavelIcon from '@mui/icons-material/Gavel';
import Link from 'next/link';

const drawerWidth = 240;

const Sidebar = () => {
  return (
    <Drawer
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
        },
      }}
      variant="permanent"
      anchor="left"
    >
      <Toolbar />
      <List>
        {/* ✅ Home */}
        <ListItem button component={Link} href="/">
          <ListItemIcon>
            <HomeIcon />
          </ListItemIcon>
          <ListItemText primary="Home" />
        </ListItem>

        {/* ✅ Register */}
        <ListItem button component={Link} href="/register">
          <ListItemIcon>
            <DescriptionIcon />
          </ListItemIcon>
          <ListItemText primary="Register" />
        </ListItem>

        {/* ✅ Transfer */}
        <ListItem button component={Link} href="/transfer">
          <ListItemIcon>
            <CompareArrowsIcon />
          </ListItemIcon>
          <ListItemText primary="Transfer" />
        </ListItem>

        {/* ✅ Mortgage */}
        <ListItem button component={Link} href="/mortgage">
          <ListItemIcon>
            <HomeWorkIcon />
          </ListItemIcon>
          <ListItemText primary="Mortgage" />
        </ListItem>

        {/* ✅ Payments */}
        <ListItem button component={Link} href="/payments">
          <ListItemIcon>
            <PaymentsIcon />
          </ListItemIcon>
          <ListItemText primary="Payments" />
        </ListItem>

        {/* ✅ Approvals */}
        <ListItem button component={Link} href="/approvals">
          <ListItemIcon>
            <GavelIcon />
          </ListItemIcon>
          <ListItemText primary="Approvals" />
        </ListItem>
      </List>
    </Drawer>
  );
};

export default Sidebar;

import { useState } from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import Chip from '@mui/material/Chip';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import TextField from '@mui/material/TextField';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import Slider from '@mui/material/Slider';

const emotions = {
  joy: {
    name: 'joy',
    display_name: 'Joy',
    color: '#87D37C',
  },
  surprise: {
    name: 'surprise',
    display_name: 'Surprise',
    color: '#FFCC99',
  },
  sadness: {
    name: 'sadness',
    display_name: 'Sadness',
    color: '#99CCFF',
  },
  anger: {
    name: 'anger',
    display_name: 'Anger',
    color: '#ff4d4d',
  },
  fear: {
    name: 'fear',
    display_name: 'Fear',
    color: '#8E44AD',
  },
  love: {
    name: 'love',
    display_name: 'Love',
    color: '#FFBDFF',
  },
};

export default function DrawerFilter({ filters, setFilters }) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [peopleInvolved, setPeopleInvolved] = useState('');
  const [value, setValue] = useState(5);

  const toggleDrawer = (newOpen) => () => {
    setOpen(newOpen);
  };

  const handleToggle = (emotion) => () => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [emotion]: !prevFilters[emotion],
    }));
  };

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const DrawerList = (
    <Box sx={{ width: 250 }} role='presentation'>
      <Toolbar>
        <IconButton
          onClick={toggleDrawer(false)}
          edge='start'
          color='inherit'
          aria-label='close drawer'
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>
        <TextField
          autoFocus
          placeholder='Search by Event Name'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon />,
          }}
          fullWidth
          sx={{ mt: 1, mb: 1 }}
        />
      </Toolbar>
      <Divider />
      <TextField
        placeholder='Search by People Involved'
        value={peopleInvolved}
        onChange={(e) => setPeopleInvolved(e.target.value)}
        fullWidth
        sx={{ mb: 1 }}
      />
      <Divider />
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DatePicker
          label='Start Date'
          value={startDate}
          onChange={(date) => setStartDate(date)}
          renderInput={(params) => <TextField {...params} fullWidth />}
          sx={{ mb: 2 }}
        />
        <DatePicker
          label='End Date'
          value={endDate}
          onChange={(date) => setEndDate(date)}
          renderInput={(params) => <TextField {...params} fullWidth />}
          sx={{ mb: 2 }}
        />
      </LocalizationProvider>
      <Divider />
      <Slider
        aria-label='Restricted values'
        defaultValue={5}
        getAriaValueText={(value) => `${value}`}
        value={value}
        onChange={handleChange}
        step={1}
        marks
        min={1}
        max={10}
        valueLabelDisplay='auto'
        sx={{ mb: 2 }}
      />
      <Divider />
      <List>
        {Object.keys(emotions).map((key) => {
          const emotion = emotions[key];
          return (
            <ListItem key={emotion.name} disablePadding>
              <Chip
                label={emotion.display_name}
                style={{
                  backgroundColor: filters[emotion.name]
                    ? emotion.color
                    : '#E0E0E0',
                  color: filters[emotion.name] ? '#000' : '#000',
                }}
                onClick={handleToggle(emotion.name)}
                sx={{ margin: '5px' }}
              />
            </ListItem>
          );
        })}
      </List>
    </Box>
  );

  return (
    <div>
      <Button onClick={toggleDrawer(true)}>Open Filter</Button>
      <Drawer anchor='left' open={open} onClose={toggleDrawer(false)}>
        {DrawerList}
      </Drawer>
    </div>
  );
}

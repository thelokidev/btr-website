import React, { useState } from 'react';
import { Grid, TextField, MenuItem, Button, Tooltip } from '@mui/material';
import LocationInput from './LocationInput';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

const moonStarLords = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];
const lagnaTypes = ['Movable', 'Fixed', 'Dual'];
const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const sexes = ['Male', 'Female'];

function BTRForm({ onSubmit }) {
  const [formData, setFormData] = useState({
    birthDateTime: null,
    location: '',
    sex: '',
    moonStarLord: '',
    lagnaType: '',
    weekday: '',
  });

  const handleChange = (field) => (event) => {
    setFormData({ ...formData, [field]: event.target.value });
  };

  const handleDateTimeChange = (newValue) => {
    setFormData({ ...formData, birthDateTime: newValue });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      birthDateTime: formData.birthDateTime ? formData.birthDateTime.toISOString() : null,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DateTimePicker
              label="Birth Date and Time"
              value={formData.birthDateTime}
              onChange={handleDateTimeChange}
              renderInput={(params) => (
                <Tooltip title="Enter your local birth date and time">
                  <TextField {...params} fullWidth />
                </Tooltip>
              )}
            />
          </LocalizationProvider>
        </Grid>
        <Grid item xs={12}>
          <Tooltip title="Enter your birth city and select from suggestions">
            <LocationInput
              value={formData.location}
              onChange={(value) => setFormData({ ...formData, location: value })}
            />
          </Tooltip>
        </Grid>
        <Grid item xs={6}>
          <TextField
            select
            label="Sex"
            value={formData.sex}
            onChange={handleChange('sex')}
            fullWidth
          >
            {sexes.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={6}>
          <Tooltip title="Select the planetary lord of your Moon star (Nakshatra)">
            <TextField
              select
              label="Moon Star Lord"
              value={formData.moonStarLord}
              onChange={handleChange('moonStarLord')}
              fullWidth
            >
              {moonStarLords.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
          </Tooltip>
        </Grid>
        <Grid item xs={6}>
          <Tooltip title="Select your Lagna (Ascendant) sign type">
            <TextField
              select
              label="Lagna Type"
              value={formData.lagnaType}
              onChange={handleChange('lagnaType')}
              fullWidth
            >
              {lagnaTypes.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
          </Tooltip>
        </Grid>
        <Grid item xs={6}>
          <Tooltip title="Select the weekday of birth (sunrise-to-sunrise)">
            <TextField
              select
              label="Weekday"
              value={formData.weekday}
              onChange={handleChange('weekday')}
              fullWidth
            >
              {weekdays.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
          </Tooltip>
        </Grid>
        <Grid item xs={12}>
          <Button type="submit" variant="contained" color="primary" fullWidth sx={{ py: 1.5 }}>
            Rectify Birth Time
          </Button>
        </Grid>
      </Grid>
    </form>
  );
}

export default BTRForm;
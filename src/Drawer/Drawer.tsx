import { Stack, TextField, Box, Drawer as MuiDrawer, Typography, Divider } from '@mui/material';
import { useState } from 'react';
import 'react-image-crop/dist/ReactCrop.css';
import ReactCrop from 'react-image-crop';
import { Crop } from 'react-image-crop/dist';
import { Card } from '@mui/material';
import { CardMedia } from '@mui/material';
import { CardContent } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import {
  convertCaptureText,
  CropsFormat,
  CustomCrop,
  getCropInit,
  isBlankCrop,
  Lang,
  LangValues,
} from './Layout';
import { CardHeader } from '@mui/material';
import { IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SettingsIcon from '@mui/icons-material/Settings';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import MenuIcon from '@mui/icons-material/Menu';
import { Tooltip } from '@mui/material';
import { Toolbar } from '@mui/material';
import { CardActionArea } from '@mui/material';
import { FormControl } from '@mui/material';
import { InputLabel } from '@mui/material';
import { Select } from '@mui/material';
import { OutlinedInput } from '@mui/material';
import { MenuItem } from '@mui/material';
import { SelectChangeEvent } from '@mui/material';
import { Checkbox } from '@mui/material';
import { ListItemText } from '@mui/material';
import { Dialog } from '@mui/material';
import { DialogTitle } from '@mui/material';
import { DialogContent } from '@mui/material';
import { Switch } from '@mui/material';
import { FormLabel } from '@mui/material';
import { FormGroup } from '@mui/material';
import { FormControlLabel } from '@mui/material';
import React from 'react';
import DocumentScanner from '@mui/icons-material/DocumentScanner';
import { Menu } from '@mui/material';
import { CSVLink } from 'react-csv';

export default function Drawer(props: {
  image: string;
  crop: Crop;
  setCrop: React.Dispatch<React.SetStateAction<Crop>>;
  cropsFormat: CropsFormat;
  setCropsFormat: React.Dispatch<React.SetStateAction<CropsFormat>>;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setTargetCropId: React.Dispatch<React.SetStateAction<number>>;
  scan: VoidFunction;
  save: VoidFunction;
  setOpenFormatsDialog: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const {
    image,
    crop,
    setCrop,
    cropsFormat,
    setCropsFormat,
    open,
    setOpen,
    setTargetCropId,
    scan,
    save,
    setOpenFormatsDialog,
  } = props;
  const [dialogCropId, setDialogCropId] = useState(0);

  const CropElement = (
    <ReactCrop
      crop={crop}
      onChange={(crop, percentCrop) => setCrop(percentCrop)}
      onComplete={(crop, percentCrop) => {
        setCrop(percentCrop);
        isBlankCrop(percentCrop) && setTargetCropId(0);
      }}
    >
      <img src={image} />
    </ReactCrop>
  );

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const contentHeader = (
    <Toolbar>
      <Typography variant="h5" color={'GrayText'}>
        {'キャプチャ結果一覧'}
      </Typography>
      <TextField
        sx={{ ml: 5, minWidth: 300 }}
        variant="filled"
        label="フォーマット名"
        value={cropsFormat.name}
        onChange={(e) =>
          setCropsFormat((cropsFormat) => ({ ...cropsFormat, name: e.target.value }))
        }
      />

      <Box sx={{ flexGrow: 1 }} />
      <IconButton
        id="demo-positioned-button"
        aria-controls={Boolean(anchorEl) ? 'demo-positioned-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={Boolean(anchorEl) ? 'true' : undefined}
        onClick={(e) => setAnchorEl(e.currentTarget)}
      >
        <MenuIcon />
      </IconButton>
      <Menu
        id="demo-positioned-menu"
        aria-labelledby="demo-positioned-button"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem
          onClick={() => {
            save();
            setAnchorEl(null);
          }}
        >
          {'SAVE'}
        </MenuItem>
        <MenuItem
          onClick={() => {
            setOpenFormatsDialog(true);
            setAnchorEl(null);
          }}
        >
          {'OPEN'}
        </MenuItem>
        <MenuItem
          onClick={() => {
            setAnchorEl(null);
          }}
        >
          <CSVLink
            data={cropsFormat.crops.map((crop) => ({
              name: crop.name,
              value: convertCaptureText(crop),
            }))}
            headers={[
              { label: '項目名', key: 'name' },
              { label: '変換結果', key: 'value' },
            ]}
          >
            {'Download'}
          </CSVLink>
        </MenuItem>
      </Menu>
    </Toolbar>
  );

  const getAction = (crop: CustomCrop) => (
    <IconButton
      onClick={() =>
        setCropsFormat((cropsFormat) => ({
          ...cropsFormat,
          crops: cropsFormat.crops.filter((c) => c.id !== crop.id),
        }))
      }
    >
      <CloseIcon />
    </IconButton>
  );

  const getTitle = (crop: CustomCrop) => (
    <TextField
      fullWidth
      variant="standard"
      label="項目名"
      value={crop.name}
      required
      onChange={(e) =>
        setCropsFormat((cropsFormat) => ({
          ...cropsFormat,
          crops: cropsFormat.crops.map((c) =>
            c.id === crop.id ? { ...crop, name: e.target.value } : c,
          ),
        }))
      }
    />
  );

  const getContent = (crop: CustomCrop) => (
    <>
      <Toolbar disableGutters variant="dense">
        <Typography variant="h5" component="div">
          {'キャプチャ結果'}
        </Typography>

        <Box sx={{ flexGrow: 1 }} />
        <IconButton
          onClick={() => {
            setCrop(crop);
            setTargetCropId(crop.id);
            setDialogCropId(crop.id);
          }}
          size="large"
        >
          <SettingsIcon />
        </IconButton>
      </Toolbar>

      <Typography variant="h6" color="text.secondary">
        {convertCaptureText(crop)}
      </Typography>
    </>
  );

  return (
    <Box>
      <Box>{CropElement}</Box>

      <MuiDrawer
        open={open}
        onClose={() => {
          setOpen(false);
          setCrop(getCropInit());
          setTargetCropId(0);
        }}
        anchor="bottom"
      >
        <Stack spacing={2} sx={{ p: 2 }}>
          {contentHeader}
          <Divider />

          <Box
            sx={{
              overflow: 'hidden',
            }}
          >
            <Grid container spacing={1}>
              {!cropsFormat.crops
                ? ''
                : cropsFormat.crops.map((crop: CustomCrop) => (
                    <Grid key={crop.id} xs={3}>
                      <Card>
                        <CardHeader action={getAction(crop)} title={getTitle(crop)} />
                        <CardActionArea
                          onClick={() => {
                            setCrop(crop);
                            setTargetCropId(crop.id);
                            setOpen(false);
                          }}
                        >
                          <CardMedia
                            sx={{ height: 140, objectFit: 'contain' }}
                            component="img"
                            src={crop.base64}
                          />
                        </CardActionArea>
                        <CardContent>{getContent(crop)}</CardContent>
                      </Card>
                    </Grid>
                  ))}
            </Grid>
          </Box>
        </Stack>
      </MuiDrawer>

      <SettingDialog
        crop={cropsFormat.crops.find((c) => c.id === dialogCropId)}
        onClose={() => setDialogCropId(0)}
        setCropsFormat={setCropsFormat}
        setCrop={setCrop}
        scan={scan}
        setTargetCropId={setTargetCropId}
      />
    </Box>
  );
}

function SettingDialog(props: {
  crop?: CustomCrop;
  onClose: VoidFunction;
  setCrop: React.Dispatch<React.SetStateAction<Crop>>;
  setCropsFormat: React.Dispatch<React.SetStateAction<CropsFormat>>;
  scan: VoidFunction;
  setTargetCropId: React.Dispatch<React.SetStateAction<number>>;
}) {
  const { crop, onClose, setCrop, setCropsFormat, scan, setTargetCropId } = props;

  const getLangs = (crop: CustomCrop) => (
    <Grid container alignItems="center">
      <Grid xs={1}>
        <Tooltip title="reScan">
          <IconButton
            onClick={() => {
              scan();
            }}
          >
            <DocumentScanner />
          </IconButton>
        </Tooltip>
      </Grid>
      <Grid xs={11}>
        <FormControl sx={{ m: 1 }} fullWidth>
          <InputLabel id={`select-langs-label`}>{'Languages'}</InputLabel>
          <Select
            labelId={`select-langs-label`}
            id={`select-langs-name`}
            multiple
            value={crop.option.langs}
            onChange={(e: SelectChangeEvent<Lang[]>) => {
              const langs = e.target.value;
              if (typeof langs === 'string') return;
              if (langs.length === 0) return;
              setCropsFormat((cropsFormat) => ({
                ...cropsFormat,
                crops: cropsFormat.crops.map((c) =>
                  c.id === crop.id ? { ...c, option: { ...c.option, langs } } : c,
                ),
              }));
            }}
            input={<OutlinedInput label="Languages" />}
            renderValue={(selected) => selected.join('+')}
          >
            {LangValues.map((lang) => (
              <MenuItem key={lang} value={lang}>
                <Checkbox checked={crop.option.langs.indexOf(lang) > -1} />
                <ListItemText primary={lang} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
    </Grid>
  );

  const getTrim = (crop: CustomCrop) => (
    <Switch
      checked={crop.option.trim}
      onChange={(_, checked) =>
        setCropsFormat((cropsFormat) => ({
          ...cropsFormat,
          crops: cropsFormat.crops.map((c) =>
            c.id === crop.id ? { ...crop, option: { ...crop.option, trim: checked } } : c,
          ),
        }))
      }
    />
  );

  const getHalfSize = (crop: CustomCrop) => (
    <Switch
      checked={crop.option.halfSize}
      onChange={(_, checked) =>
        setCropsFormat((cropsFormat) => ({
          ...cropsFormat,
          crops: cropsFormat.crops.map((c) =>
            c.id === crop.id ? { ...crop, option: { ...crop.option, halfSize: checked } } : c,
          ),
        }))
      }
    />
  );

  const getUppercase = (crop: CustomCrop) => (
    <Switch
      checked={crop.option.uppercase}
      onChange={(_, checked) =>
        setCropsFormat((cropsFormat) => ({
          ...cropsFormat,
          crops: cropsFormat.crops.map((c) =>
            c.id === crop.id ? { ...crop, option: { ...crop.option, uppercase: checked } } : c,
          ),
        }))
      }
    />
  );

  const getSwitches = (crop: CustomCrop) => (
    <FormControl component="fieldset" variant="standard" sx={{ minWidth: 500 }}>
      <FormLabel component="legend">{'キャプチャ結果の変換'}</FormLabel>
      <FormGroup sx={{ ml: 3, mt: 1 }}>
        <Grid container>
          <Grid xs={4}>
            <FormControlLabel control={getTrim(crop)} label="空白除去" />
          </Grid>
          <Grid xs={4}>
            <FormControlLabel control={getHalfSize(crop)} label="半角統一" />
          </Grid>
          <Grid xs={4}>
            <FormControlLabel control={getUppercase(crop)} label="大文字統一" />
          </Grid>
        </Grid>

        <Grid container spacing={1} alignItems="center">
          {crop.option.replaces.map(({ searchValue, replaceValue }, i) => (
            <React.Fragment key={i}>
              <Grid xs={1} sx={{ mt: 1 }}>
                <IconButton
                  onClick={() =>
                    setCropsFormat((cropsFormat) => ({
                      ...cropsFormat,
                      crops: cropsFormat.crops.map((c) =>
                        c.id !== crop.id
                          ? c
                          : {
                              ...c,
                              option: {
                                ...c.option,
                                replaces: c.option.replaces.filter((r, idx) => i !== idx),
                              },
                            },
                      ),
                    }))
                  }
                >
                  <RemoveIcon />
                </IconButton>
              </Grid>
              <Grid xs={5}>
                <TextField
                  fullWidth
                  variant="standard"
                  label={`検索${i}`}
                  value={searchValue}
                  onChange={(e) =>
                    setCropsFormat((cropsFormat) => ({
                      ...cropsFormat,
                      crops: cropsFormat.crops.map((c) =>
                        c.id !== crop.id
                          ? c
                          : {
                              ...c,
                              option: {
                                ...c.option,
                                replaces: c.option.replaces.map((r, idx) =>
                                  idx !== i ? r : { ...r, searchValue: e.target.value },
                                ),
                              },
                            },
                      ),
                    }))
                  }
                />
              </Grid>
              <Grid xs={5}>
                <TextField
                  fullWidth
                  variant="standard"
                  label={`置換${i}`}
                  value={replaceValue}
                  onChange={(e) =>
                    setCropsFormat((cropsFormat) => ({
                      ...cropsFormat,
                      crops: cropsFormat.crops.map((c) =>
                        c.id !== crop.id
                          ? c
                          : {
                              ...c,
                              option: {
                                ...c.option,
                                replaces: c.option.replaces.map((r, idx) =>
                                  idx !== i ? r : { ...r, replaceValue: e.target.value },
                                ),
                              },
                            },
                      ),
                    }))
                  }
                />
              </Grid>
              <Grid xs={1} />
            </React.Fragment>
          ))}
          <Grid xs={1} sx={{ mt: 1 }}>
            <IconButton
              onClick={() =>
                setCropsFormat((cropsFormat) => ({
                  ...cropsFormat,
                  crops: cropsFormat.crops.map((c) =>
                    c.id !== crop.id
                      ? c
                      : {
                          ...c,
                          option: {
                            ...c.option,
                            replaces: [...c.option.replaces, { searchValue: '', replaceValue: '' }],
                          },
                        },
                  ),
                }))
              }
            >
              <AddIcon />
            </IconButton>
          </Grid>
        </Grid>
      </FormGroup>
    </FormControl>
  );

  return Boolean(crop) ? (
    <Dialog onClose={onClose} open={Boolean(crop)}>
      <DialogTitle>
        <Toolbar disableGutters>
          <Typography variant="h5" color={'GrayText'}>
            {'キャプチャ設定'}
          </Typography>

          <Box sx={{ flexGrow: 1 }} />
          <IconButton onClick={onClose} size="large">
            <CloseIcon />
          </IconButton>
        </Toolbar>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          {getLangs(crop!)}
          {getSwitches(crop!)}
        </Stack>
      </DialogContent>
    </Dialog>
  ) : (
    <></>
  );
}

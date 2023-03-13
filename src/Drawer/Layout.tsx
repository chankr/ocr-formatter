import { useState } from 'react';
import { Box, Fab, IconButton } from '@mui/material';
import DocumentScannerIcon from '@mui/icons-material/DocumentScanner';
import Tooltip from '@mui/material/Tooltip';
import Drawer from './Drawer';
import Tesseract from 'tesseract.js';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import { convertToPixelCrop, Crop } from 'react-image-crop';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import { Typography } from '@mui/material';
import { Stack } from '@mui/system';
import { Dialog } from '@mui/material';
import { DialogTitle } from '@mui/material';
import { DialogContent } from '@mui/material';
import { DialogActions } from '@mui/material';
import { Button } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import { Card } from '@mui/material';
import { CardHeader } from '@mui/material';
import { CardMedia } from '@mui/material';
import { CardActionArea } from '@mui/material';
import { Snackbar } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useEffect } from 'react';
import KeyboardDoubleArrowUpIcon from '@mui/icons-material/KeyboardDoubleArrowUp';
import { Avatar } from '@mui/material';
import { blueGrey } from '@mui/material/colors';
import { Divider } from '@mui/material';

export const LangValues = ['eng', 'jpn', 'chi_sim', 'chi_tra'] as const;
export type Lang = typeof LangValues[number];
export function getLangsInit(): Lang[] {
  return ['eng', 'jpn'];
}
export function convertLangsToString(langs: Lang[]) {
  return langs.join('+');
}

export interface CustomCrop extends Crop {
  id: number;
  /** 項目名 */
  name: string;
  base64: string;
  captureText: string;
  option: CustomCropOption;
}
export interface CustomCropOption {
  langs: Lang[];
  trim: boolean;
  halfSize: boolean;
  uppercase: boolean;
  replaces: { searchValue: string; replaceValue: string }[];
}
export function getCropInit(): Crop {
  return { x: 0, y: 0, width: 0, height: 0, unit: '%' };
}
export function isBlankCrop(crop: Crop) {
  return crop.width === 0 && crop.height === 0;
}
export function convertCaptureText(crop: CustomCrop) {
  let text = crop.captureText;
  const { trim, halfSize, uppercase, replaces } = crop.option;

  if (trim) text = text.replaceAll(' ', '');
  if (halfSize)
    text = text.replace(/[Ａ-Ｚａ-ｚ０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xfee0));
  if (uppercase) text = text.toUpperCase();
  replaces.forEach(({ searchValue, replaceValue }) => {
    text = text.replaceAll(searchValue, replaceValue);
  });

  return text;
}
export interface CropsFormat {
  name: string;
  base64: string;
  crops: CustomCrop[];
}

function CustomFab(props: {
  children?: React.ReactNode;
  tooltip: string;
  onClick: VoidFunction;
  disabled: boolean;
}) {
  const { children, tooltip, onClick, disabled } = props;

  return (
    <Tooltip title={tooltip}>
      <span>
        <Fab
          color="primary"
          disabled={disabled}
          style={{
            margin: 0,
            top: 'auto',
            right: 20,
            bottom: 20 + 80 * 0,
            left: 'auto',
            position: 'fixed',
          }}
          onClick={onClick}
        >
          {children}
        </Fab>
      </span>
    </Tooltip>
  );
}

const LOCALSTORAGE_KEY = 'ocr-demo';

export default function Layout() {
  const [image, setImage] = useState('');
  const [crop, setCrop] = useState<Crop>(getCropInit());
  const [cropsFormat, setCropsFormat] = useState<CropsFormat>({
    base64: '',
    name: 'フォーマット1',
    crops: [],
  });
  const [targetCropId, setTargetCropId] = useState(0);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState('');
  const [cropsFormats, setCropsFormats] = useState<CropsFormat[]>(
    JSON.parse(localStorage.getItem(LOCALSTORAGE_KEY)!) ?? [],
  );
  const [openFormatsDialog, setOpenFormatsDialog] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);

  function getCroppedImg(image: HTMLImageElement, percentCrop: Crop) {
    const pixelCrop = convertToPixelCrop(percentCrop, image.width, image.height);
    const canvas = document.createElement('canvas');
    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;
    const ctx = canvas.getContext('2d')!;

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height,
    );

    return canvas.toDataURL('image/jpeg');
  }

  function scan() {
    setLoading('initial request');
    console.log('scan', targetCropId);

    const base64 = getCroppedImg(document.getElementsByTagName('img')[0], crop);
    const targetCrop = cropsFormat?.crops.find((c) => c.id === targetCropId);
    const langs = targetCrop?.option.langs ?? getLangsInit();
    Tesseract.recognize(base64, convertLangsToString(langs), {
      logger: (m) => setLoading(m?.status ?? 'loading'),
    })
      .then(({ data: { text } }) =>
        targetCrop ? updateCrops(base64, text, crop, targetCrop) : addCrops(base64, text, crop),
      )
      .finally(() => {
        setOpen(true);
        setLoading('');
      });
  }

  function save() {
    if (cropsFormats.some((c) => c.name === cropsFormat.name)) {
      setCropsFormats((cropsFormats) =>
        cropsFormats.map((c) => (c.name === cropsFormat.name ? cropsFormat : c)),
      );
    } else {
      setCropsFormats((cropsFormats) => [...cropsFormats, cropsFormat]);
    }
    setOpenSnackbar(true);
  }

  useEffect(() => {
    localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(cropsFormats));
  }, [cropsFormats]);

  function addCrops(base64: string, captureText: string, crop: Crop) {
    setCropsFormat((cropsFormat) => {
      const crops = cropsFormat.crops;
      const id = crops.length === 0 ? 1 : Math.max(...crops.map((c) => c.id)) + 1;
      return {
        base64: cropsFormat.base64,
        name: cropsFormat.name,
        crops: [
          ...crops,
          {
            ...crop,
            ...{
              id,
              name: `項目名${id}`,
              base64,
              captureText,
              option: {
                langs: getLangsInit(),
                halfSize: false,
                trim: false,
                uppercase: false,
                replaces: [],
              },
            },
          },
        ],
      };
    });
  }

  function updateCrops(base64: string, captureText: string, crop: Crop, targetCrop: CustomCrop) {
    console.log({ targetCrop, crop });
    setCropsFormat((cropsFormat) => ({
      base64: cropsFormat.base64,
      name: cropsFormat.name,
      crops: cropsFormat.crops.map((c) =>
        c.id !== targetCrop.id
          ? c
          : {
              ...crop,
              id: targetCrop.id,
              name: targetCrop.name,
              option: targetCrop.option,
              base64,
              captureText,
            },
      ),
    }));
  }

  return (
    <>
      {!image ? (
        <IconButton color="primary" component="label">
          <input
            hidden
            accept="image/*"
            type="file"
            onChange={(e) => {
              if (!e.target.files || e.target.files.length === 0) return;
              const fileReader = new FileReader();
              fileReader.onload = (e: any) => {
                setImage(e.currentTarget.result);
                setCropsFormat((setCropsFormat) => ({
                  ...setCropsFormat,
                  base64: e.currentTarget.result,
                }));
              };
              fileReader.readAsDataURL(e.target.files[0]);
            }}
          />
          <PhotoCamera />
        </IconButton>
      ) : (
        <Box>
          <Backdrop
            sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1000 }}
            open={Boolean(loading)}
          >
            <Stack spacing={2} justifyContent="center" alignItems="center">
              <CircularProgress color="inherit" />
              <Typography variant="h6">{loading}...</Typography>
            </Stack>
          </Backdrop>

          <Drawer
            image={image}
            crop={crop}
            setCrop={setCrop}
            cropsFormat={cropsFormat}
            setCropsFormat={setCropsFormat}
            open={open}
            setOpen={setOpen}
            setTargetCropId={setTargetCropId}
            scan={scan}
            save={save}
            setOpenFormatsDialog={setOpenFormatsDialog}
          />

          {isBlankCrop(crop) ? (
            <CustomFab
              tooltip="Open format"
              disabled={cropsFormats.length <= 0}
              onClick={() => setOpen(true)}
            >
              <KeyboardDoubleArrowUpIcon />
            </CustomFab>
          ) : (
            <CustomFab tooltip="Scan" onClick={() => scan()} disabled={false}>
              <DocumentScannerIcon />
            </CustomFab>
          )}

          <Dialog
            onClose={() => setOpenFormatsDialog(false)}
            open={openFormatsDialog}
            fullWidth
            maxWidth={false}
          >
            <DialogTitle>{'フォーマット一覧'}</DialogTitle>
            <DialogContent>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={1}>
                {cropsFormats.map((cropsFormat, key) => (
                  <Grid key={key} xs={3}>
                    <Card>
                      <CardActionArea
                        onClick={() => {
                          setCropsFormat(cropsFormat);
                          setOpenFormatsDialog(false);
                        }}
                      >
                        <CardHeader
                          avatar={
                            <Avatar sx={{ bgcolor: blueGrey[500] }} aria-label="recipe">
                              {cropsFormat.name[0]}
                            </Avatar>
                          }
                          title={cropsFormat.name}
                          subheader={'説明文'}
                        />
                        <CardMedia
                          sx={{ height: 140, objectFit: 'contain' }}
                          component="img"
                          src={cropsFormat.base64}
                        />
                      </CardActionArea>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenFormatsDialog(false)}>{'CLOSE'}</Button>
            </DialogActions>
          </Dialog>

          <Snackbar
            open={openSnackbar}
            anchorOrigin={{ horizontal: 'center', vertical: 'top' }}
            autoHideDuration={3000}
            onClose={() => setOpenSnackbar(false)}
            message="保存しました"
            action={
              <>
                <IconButton
                  size="small"
                  aria-label="close"
                  color="inherit"
                  onClick={() => setOpenSnackbar(false)}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </>
            }
          />
        </Box>
      )}
    </>
  );
}

import {
    ABSENT_VALUE,
    PROCESS_MODE_BW,
    PROCESS_MODE_GREYSCALE,
    PROCESS_MODE_VECTOR, SOURCE_TYPE_DXF,
    SOURCE_TYPE_IMAGE3D,
    SOURCE_TYPE_RASTER,
    SOURCE_TYPE_SVG, SOURCE_TYPE_TEXT
} from '../../constants';

const DEFAULT_FILL_ENABLED = false;
const DEFAULT_FILL_DENSITY = 4;

const DEFAULT_TEXT_CONFIG = {
    text: 'Snapmaker',
    name: 'text.svg',
    size: 24,
    font: 'Georgia',
    lineHeight: 1.5,
    alignment: 'left' // left, middle, right
};

const sizeModelByMachineSize = (size, width, height) => {
    let height_ = height;
    let width_ = width;
    if (width_ * size.y >= height_ * size.x && width_ > size.x) {
        height_ = size.x * height_ / width_;
        width_ = size.x;
    }
    if (height_ * size.x >= width_ * size.y && height_ > size.y) {
        width_ = size.y * width_ / height_;
        height_ = size.y;
    }
    return { width: width_, height: height_ };
};

const checkParams = (headType, sourceType, mode) => {
    if (headType !== 'laser' && headType !== 'cnc' && headType !== '3dp') {
        return false;
    }
    if (!['3d', 'raster', 'svg', 'dxf', 'text', 'image3d'].includes(sourceType)) {
        return false;
    }
    if (!['bw', 'greyscale', 'vector', 'trace'].includes(mode)) {
        return false;
    }
    return true;
};

const generateLaserDefaults = (mode, sourceType) => {
    let config = null;
    let gcodeConfig = null;
    switch (mode) {
        case PROCESS_MODE_BW: {
            config = {
                invert: false,
                bwThreshold: 168
            };
            break;
        }
        case PROCESS_MODE_GREYSCALE: {
            config = {
                invert: false,
                contrast: 50,
                brightness: 50,
                whiteClip: 255,
                bwThreshold: 168,
                algorithm: 'Atkinson'
            };
            break;
        }
        case PROCESS_MODE_VECTOR: {
            switch (sourceType) {
                case SOURCE_TYPE_RASTER: {
                    config = {
                        vectorThreshold: 128,
                        invert: false,
                        turdSize: 2
                    };
                    break;
                }
                case SOURCE_TYPE_SVG: {
                    config = {
                    };
                    break;
                }
                case SOURCE_TYPE_DXF: {
                    config = {

                    };
                    break;
                }
                case SOURCE_TYPE_TEXT: {
                    config = { ...DEFAULT_TEXT_CONFIG };
                    break;
                }
                default:
                    break;
            }
            break;
        }
        default:
            break;
    }

    if (mode === 'greyscale') {
        gcodeConfig = {
            // Default movement mode is greyscale-line
            // greyscale-line: workSpeed: 500, dwellTime: null
            // greyscale-dot: workSpeed: null, dwellTime: 42
            movementMode: 'greyscale-dot', // greyscale-line, greyscale-dot
            density: 7,
            jogSpeed: 1500,
            workSpeed: 2500,
            plungeSpeed: ABSENT_VALUE,
            dwellTime: 5,
            fixedPowerEnabled: false,
            fixedPower: 35,
            multiPassEnabled: false,
            multiPasses: 2,
            multiPassDepth: 1
        };
    } else if (mode === 'bw') {
        gcodeConfig = {
            direction: 'Horizontal',
            density: DEFAULT_FILL_DENSITY,
            jogSpeed: 3000,
            workSpeed: 800,
            plungeSpeed: ABSENT_VALUE,
            dwellTime: ABSENT_VALUE,
            fixedPowerEnabled: false,
            fixedPower: 50,
            multiPassEnabled: false,
            multiPasses: 2,
            multiPassDepth: 1
        };
    } else {
        if (sourceType === 'raster') {
            gcodeConfig = {
                optimizePath: true,
                fillEnabled: DEFAULT_FILL_ENABLED,
                fillDensity: DEFAULT_FILL_DENSITY,
                jogSpeed: 3000,
                workSpeed: 140,
                plungeSpeed: ABSENT_VALUE,
                dwellTime: ABSENT_VALUE,
                fixedPowerEnabled: false,
                fixedPower: 100,
                multiPassEnabled: true,
                multiPasses: 2,
                multiPassDepth: 0.6
            };
        } else {
            gcodeConfig = {
                optimizePath: false,
                fillEnabled: DEFAULT_FILL_ENABLED,
                fillDensity: DEFAULT_FILL_DENSITY,
                jogSpeed: 3000,
                workSpeed: 140,
                plungeSpeed: ABSENT_VALUE,
                dwellTime: ABSENT_VALUE,
                fixedPowerEnabled: false,
                fixedPower: 100,
                multiPassEnabled: true,
                multiPasses: 2,
                multiPassDepth: 0.6
            };
        }
    }
    return { config, gcodeConfig };
};

const generateCNCDefaults = (mode, sourceType) => {
    let config = null;
    let gcodeConfig = null;
    switch (mode) {
        case 'greyscale':
            switch (sourceType) {
                case SOURCE_TYPE_IMAGE3D:
                    config = {
                        invert: false,
                        plane: 'XY',
                        minGray: 0,
                        maxGray: 255,
                        sliceDensity: 10,
                        extensionX: 0,
                        extensionY: 0
                    };
                    break;
                default:
                    config = {
                        invert: true
                    };
                    break;
            }
            break;
        case 'vector':
            switch (sourceType) {
                case 'raster': {
                    config = {
                    };
                    break;
                }
                case 'svg': {
                    config = {
                    };
                    break;
                }
                case 'dxf': {
                    config = {

                    };
                    break;
                }
                case 'text': {
                    config = {
                        ...DEFAULT_TEXT_CONFIG
                    };
                    break;
                }
                default:
                    break;
            }
            break;
        case 'trace':
            config = {
            };
            break;
        default:
            break;
    }

    if (mode === 'greyscale') {
        gcodeConfig = {
            // Default movement mode is greyscale-line
            // greyscale-line: workSpeed: 500, dwellTime: null
            // greyscale-dot: workSpeed: null, dwellTime: 42
            toolDiameter: 0.1, // tool diameter (in mm)
            toolAngle: 30, // tool angle (in degree, defaults to 30° for V-Bit)
            toolShaftDiameter: 3.175,
            targetDepth: 2.0,
            stepDown: 0.5,
            safetyHeight: 1.0,
            stopHeight: 10,
            density: 5,
            jogSpeed: 3000,
            workSpeed: 600,
            plungeSpeed: 600,
            dwellTime: ABSENT_VALUE
        };
    } else {
        gcodeConfig = {
            toolDiameter: 0.1, // tool diameter (in mm)
            toolAngle: 30, // tool angle (in degree, defaults to 30° for V-Bit)
            toolShaftDiameter: 3.175, // tool angle (in degree, defaults to 30° for V-Bit)
            optimizePath: false,
            fillEnabled: DEFAULT_FILL_ENABLED,
            fillDensity: DEFAULT_FILL_DENSITY,
            pathType: 'path',
            targetDepth: 2.0,
            stepDown: 0.5,
            safetyHeight: 1,
            stopHeight: 10,
            enableTab: false,
            tabWidth: 2,
            tabHeight: -0.5,
            tabSpace: 24,
            anchor: 'Center',
            jogSpeed: 3000,
            workSpeed: 600,
            plungeSpeed: 600,
            dwellTime: ABSENT_VALUE
        };
    }

    return { config, gcodeConfig };
};

const generateModelDefaultConfigs = (headType, sourceType, mode) => {
    let defaultConfigs = {};
    if (headType === 'laser') {
        defaultConfigs = generateLaserDefaults(mode, sourceType);
    } else if (headType === 'cnc') {
        defaultConfigs = generateCNCDefaults(mode, sourceType);
    }
    return defaultConfigs;
};

export {
    DEFAULT_TEXT_CONFIG,
    sizeModelByMachineSize,
    checkParams,
    generateModelDefaultConfigs
};

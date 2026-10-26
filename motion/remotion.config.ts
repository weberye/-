import { Config } from "@remotion/cli/config";

// 輸出規格：H.264 MP4、x264 preset veryfast
Config.setCodec("h264");
Config.setX264Preset("veryfast");
Config.setVideoImageFormat("jpeg");
Config.setJpegQuality(95);
Config.setOverwriteOutput(true);

package alba.system.server.utils;

import alba.system.server.core.RecordCore;
import lombok.Getter;

import java.io.BufferedWriter;
import java.io.FileWriter;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class Logger {
    @Getter
    private static BufferedWriter writer = null;
    private static String fileName;
    private static int logCount = 0;

    private static final String defaultPath = System.getProperty("user.dir") + "\\log\\";

    public static final String ANSI_RESET = "\u001B[0m";
    public static final String ANSI_BLACK = "\u001B[30m";
    public static final String ANSI_RED = "\u001B[31m";
    public static final String ANSI_GREEN = "\u001B[32m";
    public static final String ANSI_YELLOW = "\u001B[33m";
    public static final String ANSI_BLUE = "\u001B[34m";
    public static final String ANSI_PURPLE = "\u001B[35m";
    public static final String ANSI_CYAN = "\u001B[36m";
    public static final String ANSI_WHITE = "\u001B[37m";

    public static void setWriter(BufferedWriter writer, String fileName) {
        Logger.writer = writer;
        Logger.fileName = fileName;
    }

    public static void createPath(){
        try{
            Path path = Paths.get(defaultPath + "info\\");
            if (!Files.exists(path)) {
                Files.createDirectories(path);
            }
        }catch (Exception e){
            Logger.Error(e, false);
        }
    }

    public static void saveLog(String message) {
        try {

            createPath();

            if(writer == null){
                return;
            }
            message = message.replaceAll("\u001B\\[.+?m", "");
            message = Crypto.encrypt(message);

            writer.write(message);
            writer.newLine();
            logCount++;
            if (logCount >= 0) {
                writer.flush();
                if (getFileSizeMB(fileName) > 3) {
                    String newFileName = defaultPath + "info\\" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd_HH_mm_ss")) + "_.userlog";

                    writer = new BufferedWriter(new FileWriter(newFileName));
                    fileName = newFileName;
                }
                logCount = 0;
            }
        } catch (Exception e) {
            Logger.Error(e, false);
        }
    }


    public static void Error(String message, Boolean saveLog) {
        deep(ANSI_RED + " <- E -> " + ANSI_RESET, message, saveLog);
    }

    public static void Error(Exception e, Boolean saveLog) {
        String errorMessage = e.getClass().getName() + ": " + e.getMessage();
        StackTraceElement[] stackTrace = e.getStackTrace();
        for (StackTraceElement element : stackTrace) {
            if (element.getClassName().startsWith("alba.pos")) {
                errorMessage += " at " + element.getClassName() + "." + element.getMethodName() + "(" + element.getFileName() + ":" + element.getLineNumber() + ")";
                break;
            }
        }
        Error(errorMessage, saveLog);
    }

    public static void Error(Exception e,String message, Boolean saveLog) {
        String errorMessage = e.getClass().getName() + ": " + e.getMessage();
        StackTraceElement[] stackTrace = e.getStackTrace();
        for (StackTraceElement element : stackTrace) {
            if (element.getClassName().startsWith("alba.pos")) {
                errorMessage += " at " + element.getClassName() + "." + element.getMethodName() + "(" + element.getFileName() + ":" + element.getLineNumber() + ")";
                break;
            }
        }
        Error(errorMessage + " ----> "+ message, saveLog);
    }



    public static void Info(String message, Boolean saveLog) {
        deep(ANSI_GREEN + " <- I -> " + ANSI_RESET, message, saveLog);
    }

    public static void Info(String message) {
        deep(ANSI_GREEN + " <- I -> " + ANSI_RESET, message, false);
    }

    private static long getFileSizeMB(String fileName) {
        Path path = Paths.get(fileName);
        try {
            long bytes = Files.size(path);
            return bytes / (1024 * 1024);
        } catch (IOException e) {
            e.printStackTrace();
            return 0;
        }
    }

    private static void deep(String type, String message, boolean saveLog) {
        String date = RecordCore.padRight(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")), 20);
        String msg = date + " ".repeat(5) + type + " ".repeat(5) + message;
        if (saveLog) {
            saveLog(msg);
        }
        System.out.println(msg);
    }
}

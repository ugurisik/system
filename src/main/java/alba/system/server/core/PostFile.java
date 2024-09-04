package alba.system.server.core;

import alba.system.server.utils.Logger;
import lombok.Getter;
import lombok.Setter;

import java.io.*;

@Getter
@Setter
public class PostFile {
    public static final String LOG_UNIT = "PostFile";
    private String fileName;
    private String mimeType;
    private byte[] content;

    public void save(String path) {
        try {
            BufferedOutputStream output = null;
            try {
                File postFile = new File(path);
                if (!postFile.exists()) {
                    postFile.createNewFile();
                }
                output = new BufferedOutputStream(new FileOutputStream(postFile, false));
                output.write(this.content);
            } catch (Exception e) {
                Logger.Error(e, "Can not create file.", true);
            } finally {
                if (output != null) {
                    output.close();
                }
            }
        } catch (FileNotFoundException e) {
            Logger.Error(e, "Can not find file: " + path, true);
        } catch (IOException e) {
            Logger.Error(e, "IO Problem with file: " + path, true);
        }

    }
}

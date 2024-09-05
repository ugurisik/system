package alba.system;

import alba.system.server.ServerManagment;
import alba.system.server.core.UpdateCore;
import alba.system.server.utils.Logger;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.io.BufferedWriter;
import java.io.FileWriter;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@SpringBootApplication
public class SystemApplication {

	public static String secretKey = "K3DK9SZ3";
	public static final String startTime = System.getProperty("user.dir")+"\\log\\info\\"+ LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd_HH-mm-ss"));
	public static void main(String[] args) {
		SpringApplication.run(SystemApplication.class, args);

		try {
			Logger.createPath();
			BufferedWriter writer = new BufferedWriter(new FileWriter(startTime + ".userlog"));
			Logger.setWriter(writer, startTime + ".userlog");
		} catch (Exception e) {
			System.out.println("Hata: " + e.getMessage());
		}

		ServerManagment.addStartEvent(new ServerManagment.BeforeStartEvents() {
			@Override
			public void onReady() {
				UpdateCore.ready(true);
			}
		});
		ServerManagment.main(args);
	}

}

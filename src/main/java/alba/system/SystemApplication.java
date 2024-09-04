package alba.system;

import alba.system.server.ServerManagment;
import alba.system.server.core.UpdateCore;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class SystemApplication {

	public static void main(String[] args) {
		SpringApplication.run(SystemApplication.class, args);


		ServerManagment.addStartEvent(new ServerManagment.BeforeStartEvents() {
			@Override
			public void onReady() {
				UpdateCore.ready(true);
			}
		});
		ServerManagment.main(args);
	}

}

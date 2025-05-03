package defsu.system.server.auth;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.METHOD, ElementType.TYPE})
public @interface Permission {
    String title() default "@resource";

    String name() default "@self";

    int minimumUserLevel() default 2;

    Permission.Role[] allowOnly() default {Permission.Role.USER};

    boolean allowOverride() default false;

    public static enum Role {
        ANONYMOUS,
        USER,
        MODERATOR,
        ADMINISTRATOR,
        ROOT;

        public String toString() {
            return this.name();
        }
    }
}

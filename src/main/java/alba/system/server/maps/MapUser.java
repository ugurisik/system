package alba.system.server.maps;

import java.io.Serializable;
import java.util.Date;

import jakarta.persistence.*;

@Entity
@Table(
        name = "arkuser"
)
public class MapUser implements Serializable {
    private static final long serialVersionUID = 7936550005701724996L;
    private byte[] userPK;
    private String userName;
    private String userPassword;
    private String userRealName;
    private Date userLastLoginDT;
    private byte[] roleFK;
    private String userEmail;
    private String userStyle;
    private byte[] userStatusFK;
    private byte[] userLanguageFK;
    private byte[] staffFK;
    private byte[] terminalFK;
    private byte[] userLevelFK;
    private String userKey;
    private String userPhoto;
    private Date createdDate;
    private boolean visible;
    private boolean userRequestNewPassword;
    private int migrationRef;

    @Id
    @Column(
            name = "userPK",
            unique = true,
            nullable = false
    )
    public byte[] getUserPK() {
        return this.userPK;
    }

    public void setUserPK(byte[] userPK) {
        this.userPK = userPK;
    }

    @Column(
            name = "userName",
            nullable = true,
            length = 30
    )
    public String getUserName() {
        return this.userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    @Column(
            name = "userPassword",
            nullable = true,
            length = 64
    )
    public String getUserPassword() {
        return this.userPassword;
    }

    public void setUserPassword(String userPassword) {
        this.userPassword = userPassword;
    }

    @Column(
            name = "userRealName",
            nullable = true,
            length = 255
    )
    public String getUserRealName() {
        return this.userRealName;
    }

    public void setUserRealName(String userRealName) {
        this.userRealName = userRealName;
    }

    @Temporal(TemporalType.TIMESTAMP)
    @Column(
            name = "userLastLoginDT",
            nullable = false,
            length = 10
    )
    public Date getUserLastLoginDT() {
        return this.userLastLoginDT;
    }

    public void setUserLastLoginDT(Date userLastLoginDT) {
        this.userLastLoginDT = userLastLoginDT;
    }

    @Column(
            name = "roleFK",
            nullable = false
    )
    public byte[] getRoleFK() {
        return this.roleFK;
    }

    public void setRoleFK(byte[] roleFK) {
        this.roleFK = roleFK;
    }

    @Column(
            name = "userLevelFK",
            nullable = false
    )
    public byte[] getUserLevelFK() {
        return this.userLevelFK;
    }

    public void setUserLevelFK(byte[] userLevelFK) {
        this.userLevelFK = userLevelFK;
    }

    @Column(
            name = "userEmail",
            nullable = true,
            length = 30
    )
    public String getUserEmail() {
        return this.userEmail;
    }

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }

    @Column(
            name = "userStyle",
            nullable = true,
            length = 10
    )
    public String getUserStyle() {
        return this.userStyle;
    }

    public void setUserStyle(String userStyle) {
        this.userStyle = userStyle;
    }

    @Column(
            name = "userStatusFK",
            nullable = false
    )
    public byte[] getUserStatusFK() {
        return this.userStatusFK;
    }

    public void setUserStatusFK(byte[] userStatusFK) {
        this.userStatusFK = userStatusFK;
    }

    @Column(
            name = "userLanguageFK",
            nullable = false
    )
    public byte[] getUserLanguageFK() {
        return this.userLanguageFK;
    }

    public void setUserLanguageFK(byte[] userLanguageFK) {
        this.userLanguageFK = userLanguageFK;
    }

    @Column(
            name = "staffFK",
            nullable = false
    )
    public byte[] getStaffFK() {
        return this.staffFK;
    }

    public void setStaffFK(byte[] staffFK) {
        this.staffFK = staffFK;
    }


    @Column(
            name = "terminalFK",
            nullable = false
    )
    public byte[] getTerminalFK() {
        return this.terminalFK;
    }

    public void setTerminalFK(byte[] terminalFK) {
        this.terminalFK = terminalFK;
    }

    @Column(
            name = "userKey",
            nullable = true,
            length = 100
    )
    public String getUserKey() {
        return this.userKey;
    }

    public void setUserKey(String userKey) {
        this.userKey = userKey;
    }

    @Column(
            name = "userPhoto",
            nullable = true,
            length = 50
    )
    public String getUserPhoto() {
        return this.userPhoto;
    }

    public void setUserPhoto(String userPhoto) {
        this.userPhoto = userPhoto;
    }

    @Temporal(TemporalType.TIMESTAMP)
    @Column(
            name = "createdDate",
            nullable = false,
            length = 19
    )
    public Date getCreatedDate() {
        return this.createdDate;
    }

    public void setCreatedDate(Date createdDate) {
        this.createdDate = createdDate;
    }

    @Column(
            name = "visible",
            nullable = false
    )
    public boolean getVisible() {
        return this.visible;
    }

    public void setVisible(boolean visible) {
        this.visible = visible;
    }

    @Column(
            name = "userRequestNewPassword",
            nullable = false
    )
    public boolean getUserRequestNewPassword() {
        return this.userRequestNewPassword;
    }

    public void setUserRequestNewPassword(boolean userRequestNewPassword) {
        this.userRequestNewPassword = userRequestNewPassword;
    }

    @Column(
            name = "migrationRef"
    )
    public int getMigrationRef() {
        return this.migrationRef;
    }

    public void setMigrationRef(int migrationRef) {
        this.migrationRef = migrationRef;
    }
}

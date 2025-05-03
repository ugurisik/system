package defsu.system.server.maps;

import jakarta.persistence.*;
import org.hibernate.annotations.Fetch;
import org.hibernate.annotations.FetchMode;
import org.hibernate.annotations.NotFound;
import org.hibernate.annotations.NotFoundAction;

import java.io.Serializable;
import java.util.Date;


@Entity
@Table(
        name = "userlog",
        indexes = {
                @Index(
                        name = "userlog_userFK",
                        columnList = "userFK"
                ),
                @Index( name = "userlog_manipulationLogClass",
                        columnList = "manipulationLogClass,manipulationLogTargetFK"
                )
        }
)
public class MapUserlog implements Serializable {
    private static final long serialVersionUID = 1L;
    private byte[] manipulationLogPK;
    private MapUser user;
    private byte[] userFK;
    private String manipulationLogClass;
    private byte[] manipulationLogTypeFK;
    private Date manipulationLogDT;
    private byte[] manipulationLogStatusFK;
    private byte[] manipulationLogData;
    private byte[] manipulationLogTargetFK;
    private Date createdDate;
    private boolean visible;
    private String manipulationLogClassTitle;

    @Id
    @Column(
            name = "manipulationLogPK",
            unique = true,
            nullable = false
    )
    public byte[] getManipulationLogPK() {
        return this.manipulationLogPK;
    }

    public void setManipulationLogPK(byte[] manipulationLogPK) {
        this.manipulationLogPK = manipulationLogPK;
    }

    @ManyToOne
    @JoinColumn(
            name = "userFK",
            nullable = true,
            updatable = false,
            insertable = false
    )
    @Fetch(FetchMode.JOIN)
    @NotFound(
            action = NotFoundAction.IGNORE
    )
    public MapUser getUser() {
        return this.user;
    }

    public void setUser(MapUser user) {
        this.user = user;
    }


    @Column(
            name = "manipulationLogClassTitle",
            nullable = false,
            length = 200
    )
    public String getManipulationLogClassTitle() {
        return this.manipulationLogClassTitle;
    }

    public void setManipulationLogClassTitle(String manipulationLogClassTitle) {
        this.manipulationLogClassTitle = manipulationLogClassTitle;
    }

    @Column(
            name = "userFK"
    )
    public byte[] getUserFK() {
        return this.userFK;
    }

    public void setUserFK(byte[] userFK) {
        this.userFK = userFK;
    }

    @Column(
            name = "manipulationLogClass",
            nullable = false,
            length = 200
    )
    public String getManipulationLogClass() {
        return this.manipulationLogClass;
    }

    public void setManipulationLogClass(String manipulationLogClass) {
        this.manipulationLogClass = manipulationLogClass;
    }

    @Column(
            name = "manipulationLogTypeFK"
    )
    public byte[] getManipulationLogTypeFK() {
        return this.manipulationLogTypeFK;
    }

    public void setManipulationLogTypeFK(byte[] manipulationLogTypeFK) {
        this.manipulationLogTypeFK = manipulationLogTypeFK;
    }

    @Temporal(TemporalType.TIMESTAMP)
    @Column(
            name = "manipulationLogDT",
            nullable = true,
            length = 19
    )
    public Date getManipulationLogDT() {
        return this.manipulationLogDT;
    }

    public void setManipulationLogDT(Date manipulationLogDT) {
        this.manipulationLogDT = manipulationLogDT;
    }

    @Column(
            name = "manipulationLogStatusFK"
    )
    public byte[] getManipulationLogStatusFK() {
        return this.manipulationLogStatusFK;
    }

    public void setManipulationLogStatusFK(byte[] manipulationLogStatusFK) {
        this.manipulationLogStatusFK = manipulationLogStatusFK;
    }

    @Column(
            name = "manipulationLogData",
            nullable = false,
            columnDefinition = "blob"
    )
    public byte[] getManipulationLogData() {
        return this.manipulationLogData;
    }

    public void setManipulationLogData(byte[] manipulationLogData) {
        this.manipulationLogData = manipulationLogData;
    }

    @Column(
            name = "manipulationLogTargetFK"

    )
    public byte[] getManipulationLogTargetFK() {
        return this.manipulationLogTargetFK;
    }

    public void setManipulationLogTargetFK(byte[] manipulationLogTargetFK) {
        this.manipulationLogTargetFK = manipulationLogTargetFK;
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
}

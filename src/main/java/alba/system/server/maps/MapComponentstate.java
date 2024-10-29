package alba.system.server.maps;


import jakarta.persistence.*;
import org.hibernate.annotations.Fetch;
import org.hibernate.annotations.FetchMode;

import java.io.Serializable;
import java.util.Date;

@Entity
@Table(
        name = "userpreferencee"
)
public class MapComponentstate implements Serializable {
    private byte[] componentStatePK;
    private byte[] userFK;
    private String componentStateFormId;
    private String componentStateCmpId;
    private String componentStateProperty;
    private String componentStateValue;
    private byte[] componentStateValueTypeFK;
    private MapUser user;
    private Date createdDate;
    private boolean visible;

    @Id
    @Column(
            name = "componentStatePK",
            unique = true,
            nullable = false
    )
    public byte[] getComponentStatePK() {
        return this.componentStatePK;
    }

    public void setComponentStatePK(byte[] componentStatePK) {
        this.componentStatePK = componentStatePK;
    }

    @Column(
            name = "userFK",
            nullable = false
    )
    public byte[] getUserFK() {
        return this.userFK;
    }

    public void setUserFK(byte[] userFK) {
        this.userFK = userFK;
    }

    @Column(
            name = "componentStateFormId",
            nullable = false,
            length = 50
    )
    public String getComponentStateFormId() {
        return this.componentStateFormId;
    }

    public void setComponentStateFormId(String componentStateFormId) {
        this.componentStateFormId = componentStateFormId;
    }

    @Column(
            name = "componentStateCmpId",
            nullable = false,
            length = 100
    )
    public String getComponentStateCmpId() {
        return this.componentStateCmpId;
    }

    public void setComponentStateCmpId(String componentStateCmpId) {
        this.componentStateCmpId = componentStateCmpId;
    }

    @Column(
            name = "componentStateProperty",
            nullable = false,
            length = 30
    )
    public String getComponentStateProperty() {
        return this.componentStateProperty;
    }

    public void setComponentStateProperty(String componentStateProperty) {
        this.componentStateProperty = componentStateProperty;
    }

    @Column(
            name = "componentStateValue",
            nullable = false,
            length = 10000
    )
    public String getComponentStateValue() {
        return this.componentStateValue;
    }

    public void setComponentStateValue(String componentStateValue) {
        this.componentStateValue = componentStateValue;
    }

    @Column(
            name = "componentStateValueTypeFK",
            nullable = false
    )
    public byte[] getComponentStateValueTypeFK() {
        return this.componentStateValueTypeFK;
    }

    public void setComponentStateValueTypeFK(byte[] componentStateValueTypeFK) {
        this.componentStateValueTypeFK = componentStateValueTypeFK;
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

    @ManyToOne
    @JoinColumn(
            name = "userFK",
            nullable = true,
            updatable = false,
            insertable = false
    )
    @Fetch(FetchMode.JOIN)
    public MapUser getUser() {
        return this.user;
    }

    public void setUser(MapUser user) {
        this.user = user;
    }
}

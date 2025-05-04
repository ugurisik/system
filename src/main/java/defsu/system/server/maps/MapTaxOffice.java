package defsu.system.server.maps;

import jakarta.persistence.*;

import java.io.Serializable;
import java.util.Date;

@Entity
@Table(
        name = "taxoffice"
)
public class MapTaxOffice implements Serializable {
    @Id
    @Column(
            name = "taxofficePK",
            unique = true,
            nullable = false
    )
    private byte[] taxofficePK;

    @Column(
            name = "taxOfficeName",
            nullable = true,
            length = 100
    )
    private String taxOfficeName;
    @Column(
            name = "taxOfficeCode"
    )
    private int taxOfficeCode;
    @Column(
            name = "cityFK",
            nullable = true
    )
    private byte[] cityFK;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(
            name = "createdDate",
            nullable = false,
            length = 19
    )
    private Date createdDate;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(
            name = "updatedDate",
            nullable = false,
            length = 19
    )
    private Date updatedDate;

    @Column(
            name = "visible",
            nullable = false
    )
    private boolean visible;

    @Column(
            name = "creatorFK",
            nullable = true
    )
    private byte[] creatorFK;

    @Column(
            name = "updaterFK",
            nullable = true
    )
    private byte[] updaterFK;

    public byte[] getTaxofficePK() {
        return taxofficePK;
    }

    public void setTaxofficePK(byte[] taxofficePK) {
        this.taxofficePK = taxofficePK;
    }

    public String getTaxOfficeName() {
        return taxOfficeName;
    }

    public void setTaxOfficeName(String taxOfficeName) {
        this.taxOfficeName = taxOfficeName;
    }

    public int getTaxOfficeCode() {
        return taxOfficeCode;
    }

    public void setTaxOfficeCode(int taxOfficeCode) {
        this.taxOfficeCode = taxOfficeCode;
    }

    public byte[] getCityFK() {
        return cityFK;
    }

    public void setCityFK(byte[] cityFK) {
        this.cityFK = cityFK;
    }

    public Date getCreatedDate() {
        return createdDate;
    }

    public void setCreatedDate(Date createdDate) {
        this.createdDate = createdDate;
    }

    public Date getUpdatedDate() {
        return updatedDate;
    }

    public void setUpdatedDate(Date updatedDate) {
        this.updatedDate = updatedDate;
    }

    public boolean getVisible() {
        return visible;
    }

    public void setVisible(boolean visible) {
        this.visible = visible;
    }

    public byte[] getCreatorFK() {
        return creatorFK;
    }

    public void setCreatorFK(byte[] creatorFK) {
        this.creatorFK = creatorFK;
    }

    public byte[] getUpdaterFK() {
        return updaterFK;
    }

    public void setUpdaterFK(byte[] updaterFK) {
        this.updaterFK = updaterFK;
    }
}

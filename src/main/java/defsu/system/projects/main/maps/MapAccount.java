package defsu.system.projects.main.maps;

import jakarta.persistence.*;

import java.io.Serializable;
import java.util.Date;

@Entity
@Table(name = "account")
public class MapAccount implements Serializable {

    @Id
    @Column(
            name = "accountPK",
            unique = true,
            nullable = false
    )
    private byte[] accountPK;
    @Column(
            name = "usableFK",
            nullable = true
    )
    private byte[] usableFK;
    @Column(
            name = "typeFK",
            nullable = true
    )
    private byte[] typeFK;
    @Column(
            name = "taxOfficeFK",
            nullable = true
    )
    private byte[] taxOfficeFK;
    @Column(
            name = "cityFK",
            nullable = true
    )
    private byte[] cityFK;
    @Column(
            name = "accountCode",
            nullable = true,
            length = 20
    )
    private String accountCode;
    @Column(
            name = "accountName",
            nullable = true,
            length = 400
    )
    private String accountName;
    @Column(
            name = "address1",
            nullable = true,
            length = 400
    )
    private String address1;
    @Column(
            name = "address2",
            nullable = true,
            length = 400
    )
    private String address2;
    @Column(
            name = "tel1",
            nullable = true,
            length = 20
    )
    private String tel1;
    @Column(
            name = "tel2",
            nullable = true,
            length = 20
    )
    private String tel2;
    @Column(
            name = "fax",
            nullable = true,
            length = 20
    )
    private String fax;
    @Column(
            name = "email",
            nullable = true,
            length = 64
    )
    private String email;
    @Column(
            name = "authorizedPerson",
            nullable = true,
            length = 64
    )
    private String authorizedPerson;
    @Column(
            name = "authorizedPersonTel",
            nullable = true,
            length = 64
    )
    private String authorizedPersonTel;
    @Column(
            name = "taxNo",
            nullable = true,
            length = 11
    )
    private String taxNo;
    @Column(
            name = "note",
            nullable = true,
            length = 512
    )
    private String note;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(
            name = "createdDate",
            nullable = false
    )
    private Date createdDate;
    @Temporal(TemporalType.TIMESTAMP)
    @Column(
            name = "updatedDate",
            nullable = false
    )
    private Date updatedDate;
    @Column(
            name = "visible",
            nullable = false
    )
    private boolean visible;
    @Column(
            name = "creatorFK",
            nullable = false
    )
    private byte[] creatorFK;
    @Column(
            name = "updaterFK",
            nullable = false
    )
    private byte[] updaterFK;



    public byte[] getAccountPK() {
        return accountPK;
    }
    public void setAccountPK(byte[] accountPK) {
        this.accountPK = accountPK;
    }


    public byte[] getUsableFK() {
        return usableFK;
    }

    public void setUsableFK(byte[] usableFK) {
        this.usableFK = usableFK;
    }

    public byte[] getTypeFK() {
        return typeFK;
    }

    public void setTypeFK(byte[] typeFK) {
        this.typeFK = typeFK;
    }

    public byte[] getTaxOfficeFK() {
        return taxOfficeFK;
    }

    public void setTaxOfficeFK(byte[] taxOfficeFK) {
        this.taxOfficeFK = taxOfficeFK;
    }

    public byte[] getCityFK() {
        return cityFK;
    }

    public void setCityFK(byte[] cityFK) {
        this.cityFK = cityFK;
    }

    public String getAccountCode() {
        return accountCode;
    }

    public void setAccountCode(String accountCode) {
        this.accountCode = accountCode;
    }

    public String getAccountName() {
        return accountName;
    }

    public void setAccountName(String accountName) {
        this.accountName = accountName;
    }

    public String getAddress1() {
        return address1;
    }

    public void setAddress1(String address1) {
        this.address1 = address1;
    }

    public String getAddress2() {
        return address2;
    }

    public void setAddress2(String address2) {
        this.address2 = address2;
    }

    public String getTel1() {
        return tel1;
    }

    public void setTel1(String tel1) {
        this.tel1 = tel1;
    }

    public String getTel2() {
        return tel2;
    }

    public void setTel2(String tel2) {
        this.tel2 = tel2;
    }

    public String getFax() {
        return fax;
    }

    public void setFax(String fax) {
        this.fax = fax;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getAuthorizedPerson() {
        return authorizedPerson;
    }

    public void setAuthorizedPerson(String authorizedPerson) {
        this.authorizedPerson = authorizedPerson;
    }

    public String getAuthorizedPersonTel() {
        return authorizedPersonTel;
    }

    public void setAuthorizedPersonTel(String authorizedPersonTel) {
        this.authorizedPersonTel = authorizedPersonTel;
    }

    public String getTaxNo() {
        return taxNo;
    }

    public void setTaxNo(String taxNo) {
        this.taxNo = taxNo;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
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

package defsu.system.server.maps;

import jakarta.persistence.*;

import java.io.Serializable;
import java.util.Date;

@Entity
@Table(
        name = "city",
        indexes = {
                @Index(
                        name = "cityName",
                        columnList = "cityName"
                ),
                @Index(
                        name = "cityPlateCode",
                        columnList = "cityPlateCode"
                ),
                @Index(
                        name = "cityPhoneCode",
                        columnList = "cityPhoneCode"
                ),
                @Index(
                        name = "cityPhoneCodeMulti",
                        columnList = "cityPhoneCode,cityName"
                )
        }
)
public class MapCity implements Serializable {

    @Id
    @Column(
            name = "cityPK",
            unique = true,
            nullable = false
    )
    private byte[] cityPK;

    @Column(
            name = "cityName",
            nullable = true,
            length = 128
    )
    private String cityName;

    @Column(
            name = "cityPlateCode",
            nullable = true,
            length = 20
    )
    private String cityPlateCode;

    @Column(
            name = "cityPhoneCode",
            nullable = true,
            length = 8
    )
    private String cityPhoneCode;

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
}

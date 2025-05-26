package backend.Dashboard.dto;

import lombok.Data;
import java.sql.Date;

@Data
public class MonthlyUsageDTO {
    private Date month;
    private int promptCount;
    private int totalViews;
}
package querybuilder

import (
	"fmt"
	"strings"
	"time"

	"github.com/fivemanage/lite/api"
	"github.com/huandu/go-sqlbuilder"
)

var topLevelFields = map[string]struct{}{
	"Timestamp":     {},
	"DatasetId":     {},
	"TraceId":       {},
	"TeamId":        {},
	"Body":          {},
	"RetentionDays": {},
}

type Builder struct {
	query *sqlbuilder.SelectBuilder
}

func New() *Builder {
	sb := sqlbuilder.NewSelectBuilder()
	sb.Select("*")
	sb.From("logs")
	return &Builder{
		query: sb,
	}
}

func (b *Builder) Filter(filter api.DatasetFilter) *Builder {
	if cond := b.buildCondition(filter); cond != "" {
		b.query.Where(cond)
	}
	return b
}

func (b *Builder) buildCondition(filter api.DatasetFilter) string {
	if filter.Field != "" && filter.Operator != "" && filter.Value != nil {
		field := filter.Field
		if _, ok := topLevelFields[field]; !ok {
			field = fmt.Sprintf("Attributes['%s']", filter.Field)
		}
		value := *filter.Value
		switch filter.Operator {
		case "contains":
			return fmt.Sprintf("positionCaseInsensitive(%s, '%s') > 0", field, value)
		case "not-contains":
			return fmt.Sprintf("positionCaseInsensitive(%s, '%s') = 0", field, value)
		case "starts-with":
			return b.query.Like(field, value+"%")
		case "ends-with":
			return b.query.Like(field, "%"+value)
		case "==":
			return b.query.Equal(field, value)
		case "!=":
			return b.query.NotEqual(field, value)
		case ">":
			return b.query.GreaterThan(field, value)
		case "<":
			return b.query.LessThan(field, value)
		case ">=":
			return b.query.GreaterEqualThan(field, value)
		case "<=":
			return b.query.LessEqualThan(field, value)
		case "exists":
			return fmt.Sprintf("has(%s)", field)
		case "not-exists":
			return fmt.Sprintf("not has(%s)", field)
		}
	}

	if len(filter.Children) > 0 {
		var conditions []string
		for _, child := range filter.Children {
			if cond := b.buildCondition(child); cond != "" {
				conditions = append(conditions, cond)
			}
		}

		if len(conditions) > 0 {
			logicalOperator := " AND "
			if strings.ToUpper(filter.Operator) == "OR" {
				logicalOperator = " OR "
			}
			return fmt.Sprintf("(%s)", strings.Join(conditions, logicalOperator))
		}
	}

	return ""
}

func (b *Builder) WithDateRange(startTime, endTime time.Time) *Builder {
	b.query.Where(b.query.Between("Timestamp", startTime, endTime))
	return b
}

func (b *Builder) Build(organizationID, datasetID string) (string, []interface{}) {
	b.query.Where(b.query.Equal("TeamId", organizationID))
	b.query.Where(b.query.Equal("DatasetId", datasetID))
	return b.query.BuildWithFlavor(sqlbuilder.ClickHouse)
}

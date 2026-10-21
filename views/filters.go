package views

import (
	"net/url"
	"strings"
)

type filterChip struct{ Label, URL string }

func filterChips(m Model) []filterChip {
	u, e := url.Parse(m.Return)
	if e != nil {
		return nil
	}
	q := u.Query()
	out := []filterChip{}
	for _, key := range []string{"q", "category", "size", "color", "material", "collection", "price", "inStock"} {
		if value := strings.Join(q[key], ","); value != "" {
			label := value
			if key == "inStock" {
				label = "Available in demo"
			}
			if key == "q" {
				label = "Search: " + value
			}
			next := u.Query()
			next.Del(key)
			next.Del("page")
			next.Del("notice")
			out = append(out, filterChip{Label: label, URL: "/shop?" + next.Encode()})
		}
	}
	return out
}

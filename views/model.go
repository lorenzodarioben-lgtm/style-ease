package views

import (
	"fmt"
	"net/url"
	"slices"
	"strconv"
	"strings"

	"github.com/lorenzodarioben-lgtm/style-ease/internal/domain"
)

type Model struct {
	ActiveLook                                      domain.Look
	Title, Path, Return, Notice, OrderKey, Scenario string
	Session                                         domain.Session
	State                                           domain.Snapshot
	Products, Results                               []domain.Product
	Product                                         domain.Product
	Query                                           domain.Query
	Count, Pages                                    int
	Order                                           domain.Order
	Reviews                                         []domain.Review
	Collections                                     []domain.Collection
	CollectionSummary                               string
}

func collectionHero(m Model, slug string) domain.Product {
	for _, p := range m.Products {
		if slices.Contains(p.Collections, slug) {
			return p
		}
	}
	return domain.Product{}
}

func n(i int) string                      { return strconv.Itoa(i) }
func money(i int) string                  { return domain.Money(i) }
func total(lines []domain.Line) string    { return money(domain.Total(lines)) }
func imageSmall(path string) string       { return strings.Replace(path, "-960.", "-480.", 1) }
func imageSet(path string) string         { return imageSmall(path) + " 480w, " + path + " 960w" }
func productPath(p domain.Product) string { return "/products/" + p.Slug }
func isSelected(current, value string) bool {
	return slices.Contains(strings.Split(current, ","), value)
}
func options(products []domain.Product, kind string) []string {
	out := []string{}
	for _, p := range products {
		var vs []string
		switch kind {
		case "category":
			vs = []string{p.Category}
		case "size":
			vs = p.Sizes
		case "color":
			vs = p.Colors
		case "material":
			vs = []string{p.Material}
		}
		for _, v := range vs {
			if !slices.Contains(out, v) {
				out = append(out, v)
			}
		}
	}
	return out
}
func countBag(m Model) string { return n(domain.Quantity(m.State.Bag)) }
func active(m Model, path string) string {
	if m.Path == path || path == "/shop" && strings.HasPrefix(m.Path, "/products/") {
		return "page"
	}
	return "false"
}
func CollectionTitle(slug string) string {
	switch slug {
	case "structure":
		return "The Structure Edit"
	case "everyday":
		return "Everyday, reconsidered"
	default:
		return "Objects of interest"
	}
}
func CollectionDescription(slug string) string {
	switch slug {
	case "structure":
		return "A study in proportion. Discover jackets and denim, then make the silhouette your own."
	case "everyday":
		return "Start with the pieces you return to. A focused edit of tops and knitwear, ready to combine."
	default:
		return "A different point of emphasis. Accessories and footwear to bring a composition together."
	}
}
func pageURL(m Model, page int) string {
	u, _ := url.Parse(m.Return)
	v := u.Query()
	v.Del("notice")
	v.Set("page", n(page))
	return "/shop?" + v.Encode()
}
func ProductByID(ps []domain.Product, id int) domain.Product {
	for _, p := range ps {
		if p.ID == id {
			return p
		}
	}
	return domain.Product{}
}
func remaining(m Model, p domain.Product) int {
	n := p.Stock
	for _, l := range m.State.Bag {
		if l.Product.ID == p.ID {
			n -= l.Quantity
		}
	}
	return max(0, n)
}
func defaultSize(p domain.Product) string {
	if slices.Contains(p.Sizes, "M") {
		return "M"
	}
	if len(p.Sizes) > 0 {
		return p.Sizes[0]
	}
	return ""
}
func stars(rating int) string               { return fmt.Sprintf("%d / 5", rating) }
func queryValue(m Model, key string) string { u, _ := url.Parse(m.Return); return u.Query().Get(key) }
func stringJoin(values []string) string     { return strings.Join(values, ", ") }
func urlEscape(v string) string             { return url.QueryEscape(v) }

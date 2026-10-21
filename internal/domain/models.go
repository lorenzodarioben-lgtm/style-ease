package domain

import (
	"errors"
	"fmt"
	"net/url"
	"slices"
	"strconv"
	"strings"
	"time"
)

var ErrInvalid = errors.New("Choose a valid available option and quantity.")
var ErrCapacity = errors.New("This selection exceeds the shared demo stock for this piece.")
var ErrLimit = errors.New("You have reached the limit. Remove an item before adding another.")
var ErrNotFound = errors.New("This item could not be found.")

type Product struct {
	ID          int       `json:"id"`
	Slug        string    `json:"slug"`
	Name        string    `json:"name"`
	Category    string    `json:"category"`
	Description string    `json:"description"`
	Material    string    `json:"material"`
	Price       int       `json:"price"`
	Stock       int       `json:"stock"`
	Sizes       []string  `json:"sizes"`
	Colors      []string  `json:"colors"`
	Image       string    `json:"image"`
	Source      string    `json:"source"`
	Variants    []Variant `json:"-"`
	Collections []string  `json:"collections"`
}
type Variant struct {
	ID, ProductID int
	Size, Color   string
	Active        bool
}
type Collection struct{ Slug, Title, Summary string }
type Line struct {
	Variant  Variant
	Product  Product
	Quantity int
}
type Order struct {
	Code, Created string
	Total         int
	Lines         []ReceiptLine
}
type ReceiptLine struct {
	Name, Slug, Size, Color string
	Price, Quantity         int
	ProductID               int
}
type Review struct {
	Rating           int
	Comment, Created string
}
type Look struct {
	ID, Name string
	Lines    []Line
	Total    int
}
type Session struct {
	Key, CSRF string
	Expires   time.Time
}
type Snapshot struct {
	Bag, Wishlist   []Line
	Compare, Recent []Product
	Orders          []Order
	Looks           []Look
}

func Money(minor int) string { return fmt.Sprintf("$%d.%02d", minor/100, minor%100) }
func Total(lines []Line) int {
	n := 0
	for _, l := range lines {
		n += l.Product.Price * l.Quantity
	}
	return n
}
func Quantity(lines []Line) int {
	n := 0
	for _, l := range lines {
		n += l.Quantity
	}
	return n
}
func ValidateQuantity(stock, existing, quantity int) error {
	if quantity < 1 || quantity > 99 {
		return ErrInvalid
	}
	if quantity+existing > stock {
		return ErrCapacity
	}
	return nil
}
func (p Product) Variant(size, color string) (Variant, error) {
	for _, v := range p.Variants {
		if v.Active && v.Size == size && v.Color == color {
			return v, nil
		}
	}
	return Variant{}, ErrInvalid
}

type Query struct {
	Search, Category, Size, Color, Material, Collection, Price, Sort string
	InStock                                                          bool
	Page                                                             int
}

var Sorts = []string{"featured", "newest", "price-asc", "price-desc", "name"}

func ParseQuery(v url.Values) Query {
	q := Query{Search: strings.TrimSpace(v.Get("q")), Category: v.Get("category"), Size: v.Get("size"), Color: v.Get("color"), Material: v.Get("material"), Collection: v.Get("collection"), Price: v.Get("price"), Sort: v.Get("sort"), InStock: v.Get("inStock") == "1", Page: 1}
	if len(q.Search) > 100 {
		q.Search = string([]rune(q.Search)[:min(100, len([]rune(q.Search)))])
	}
	if !slices.Contains(Sorts, q.Sort) {
		q.Sort = "featured"
	}
	if n, e := strconv.Atoi(v.Get("page")); e == nil {
		q.Page = max(1, min(1000, n))
	}
	if q.Category == "T-Shirts" {
		q.Category = "Tops"
	}
	return q
}
func matchesList(value, filter string) bool {
	return filter == "" || slices.Contains(strings.Split(filter, ","), value)
}
func overlap(values []string, filter string) bool {
	if filter == "" {
		return true
	}
	for _, v := range values {
		if matchesList(v, filter) {
			return true
		}
	}
	return false
}
func Filter(products []Product, q Query) []Product {
	out := []Product{}
	for _, p := range products {
		hay := strings.ToLower(strings.Join([]string{p.Name, p.Description, p.Category, p.Material, strings.Join(p.Sizes, " "), strings.Join(p.Colors, " ")}, " "))
		found := true
		for _, term := range strings.Fields(strings.ToLower(q.Search)) {
			if !strings.Contains(hay, term) {
				found = false
			}
		}
		if !found || !matchesList(p.Category, q.Category) || !overlap(p.Sizes, q.Size) || !overlap(p.Colors, q.Color) || (q.InStock && p.Stock == 0) || (q.Material != "" && p.Material != q.Material) {
			continue
		}
		if q.Price == "Under $50" && p.Price >= 5000 || q.Price == "$50 to $100" && (p.Price < 5000 || p.Price > 10000) || q.Price == "Over $100" && p.Price <= 10000 {
			continue
		}
		if q.Collection != "" && !slices.Contains(p.Collections, q.Collection) {
			continue
		}
		out = append(out, p)
	}
	slices.SortStableFunc(out, func(a, b Product) int {
		switch q.Sort {
		case "price-asc":
			return a.Price - b.Price
		case "price-desc":
			return b.Price - a.Price
		case "newest":
			return b.ID - a.ID
		case "name":
			return strings.Compare(a.Name, b.Name)
		default:
			return 0
		}
	})
	return out
}
func Related(products []Product, p Product) []Product {
	out := []Product{}
	for _, other := range products {
		if other.ID != p.ID && other.Category == p.Category {
			out = append(out, other)
		}
	}
	return out[:min(4, len(out))]
}

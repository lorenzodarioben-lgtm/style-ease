package web

import (
	"context"
	"github.com/lorenzodarioben-lgtm/style-ease/internal/domain"
	"net/url"
	"strconv"
	"strings"
)

func (s *Server) studioPost(ctx context.Context, key, path string, f url.Values) (string, error) {
	if path == "/studio/save" {
		vs := []int{}
		for _, raw := range f["variant"] {
			if raw == "" {
				continue
			}
			v, e := strconv.Atoi(raw)
			if e != nil {
				return "", domain.ErrInvalid
			}
			vs = append(vs, v)
		}
		id, e := s.DB.SaveLookID(ctx, key, strings.TrimSpace(f.Get("name")), vs)
		return "/studio?look=" + url.QueryEscape(id), e
	}
	e := s.DB.LookAction(ctx, key, f.Get("look"), strings.TrimPrefix(path, "/studio/"), strings.TrimSpace(f.Get("name")))
	if path == "/studio/delete" {
		return "/studio", e
	}
	if path == "/studio/bag" {
		return "/bag", e
	}
	return "/studio?look=" + url.QueryEscape(f.Get("look")), e
}
